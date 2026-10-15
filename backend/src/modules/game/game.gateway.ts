import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { RoomDisconnectionService } from '../rooms/services/room-disconnection.service';
import { GameTimerService } from './services/game-timer.service';
import { GameCoordinatorService } from './services/game-coordinator.service';
import { GameDisconnectHandlerService } from './services/game-disconnect-handler.service';
import { GameActionHandlerService } from './services/game-action-handler.service';
import { CreateRoomDto } from '../rooms/dto/create-room.dto';
import { JoinRoomDto } from '../rooms/dto/join-room.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly rooms: RoomsService,
    private readonly disconnectService: RoomDisconnectionService,
    private readonly disconnectHandler: GameDisconnectHandlerService,
    private readonly gameTimer: GameTimerService,
    private readonly coordinator: GameCoordinatorService,
    private readonly actions: GameActionHandlerService,
  ) {}

  handleDisconnect(client: Socket) { this.disconnectHandler.handleDisconnect(this.server, client); }

  @SubscribeMessage('room:create')
  handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() dto: CreateRoomDto) {
    const room = this.rooms.createRoom(client.id, dto);
    client.join(room.roomCode);
    if (dto.isHostPlaying) this.server.to(room.roomCode).emit('room:players_updated', { players: Array.from(room.players.values()), theme: room.theme });
    return { roomCode: room.roomCode, categoryId: room.categoryId, durationSeconds: room.durationSeconds, theme: room.theme, isHostPlaying: dto.isHostPlaying };
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinRoomDto) {
    const { room, player } = this.rooms.joinRoom(client.id, dto);
    this.disconnectService.cancelTimersOnReconnect(room.roomCode);
    client.join(room.roomCode);
    this.server.to(room.roomCode).emit('room:players_updated', { players: Array.from(room.players.values()), hostSocketId: room.hostSocketId, theme: room.theme });
    return { success: true, player, roomCode: room.roomCode, categoryId: room.categoryId, durationSeconds: room.durationSeconds, theme: room.theme, players: Array.from(room.players.values()), isHost: room.hostSocketId === client.id };
  }

  @SubscribeMessage('room:update_config')
  handleUpdateConfig(@ConnectedSocket() c: Socket, @MessageBody() d: { roomCode: string; categoryId?: string; durationSeconds?: number; theme?: any }) {
    const r = this.rooms.updateConfig(d.roomCode, c.id, d.categoryId, d.durationSeconds, d.theme);
    if (!r) return { success: false };
    this.server.to(r.roomCode).emit('room:config_updated', { categoryId: r.categoryId, durationSeconds: r.durationSeconds, theme: r.theme });
    return { success: true, categoryId: r.categoryId, durationSeconds: r.durationSeconds, theme: r.theme };
  }

  @SubscribeMessage('room:host_set_role')
  handleHostSetRole(@ConnectedSocket() client: Socket, @MessageBody() d: { roomCode: string; isHostPlaying: boolean; nickname?: string; avatarId?: number }) {
    const room = this.rooms.setHostPlayerRole(d.roomCode, client.id, d.isHostPlaying, d.nickname, d.avatarId);
    if (!room) return { success: false };
    this.server.to(room.roomCode).emit('room:players_updated', { players: Array.from(room.players.values()), hostSocketId: room.hostSocketId });
    return { success: true, players: Array.from(room.players.values()) };
  }

  @SubscribeMessage('room:reconnect')
  handleReconnect(@ConnectedSocket() client: Socket, @MessageBody() data: { roomCode: string; role: 'host' | 'player'; nickname?: string }) {
    if (data.role === 'host') {
      const room = this.rooms.reconnectHost(data.roomCode, client.id);
      if (!room) return { success: false, message: 'Sala no encontrada' };
      this.disconnectService.cancelTimersOnReconnect(room.roomCode);
      client.join(room.roomCode);
      this.server.to(room.roomCode).emit('room:players_updated', { players: Array.from(room.players.values()), hostSocketId: room.hostSocketId });
      return { success: true, roomCode: room.roomCode, status: room.status, players: Array.from(room.players.values()), categoryId: room.categoryId, durationSeconds: room.durationSeconds, theme: room.theme, isHost: true };
    }
    const res = this.rooms.reconnectPlayer(data.roomCode, data.nickname || '', client.id);
    if (!res) return { success: false, message: 'Jugador no encontrado' };
    this.disconnectService.cancelTimersOnReconnect(res.room.roomCode);
    client.join(res.room.roomCode);
    this.server.to(res.room.roomCode).emit('room:players_updated', { players: Array.from(res.room.players.values()), hostSocketId: res.room.hostSocketId });
    return { success: true, roomCode: res.room.roomCode, status: res.room.status, player: res.player, players: Array.from(res.room.players.values()), categoryId: res.room.categoryId, durationSeconds: res.room.durationSeconds, theme: res.room.theme, options: res.room.passwordsPool.slice(0, 5), isHost: res.room.hostSocketId === client.id };
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const res = this.rooms.leaveRoom(client.id);
    if (!res) return { success: false };
    client.leave(res.room.roomCode);
    this.server.to(res.room.roomCode).emit('room:players_updated', {
      players: Array.from(res.room.players.values()),
      hostSocketId: res.room.hostSocketId,
    });
    if (res.nextHost) {
      this.server.to(res.room.roomCode).emit('room:host_promoted', { newHostId: res.nextHost.socketId, newHostNickname: res.nextHost.nickname });
    }
    return { success: true };
  }

  @SubscribeMessage('game:start')
  async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomCode: string }) {
    const room = this.rooms.getRoom(data.roomCode);
    if (!room || room.players.size < 2) return { success: false, message: 'Mínimo 2 jugadores activos requeridos' };
    await this.coordinator.startGame(data.roomCode);
    let optIdx = 0;
    for (const p of room.players.values()) {
      const opts = room.passwordsPool.slice(optIdx, optIdx + 5);
      optIdx = (optIdx + 5) % Math.max(1, room.passwordsPool.length - 5);
      this.server.to(p.socketId).emit('game:setup_passwords', { options: opts, durationSeconds: 10 });
    }
    setTimeout(() => {
      let pIdx = 0;
      for (const p of room.players.values()) {
        if (!p.password) {
          p.password = room.passwordsPool[pIdx % room.passwordsPool.length];
          pIdx++;
        }
      }
      room.status = 'PLAYING';
      this.server.to(room.roomCode).emit('game:started', { durationSeconds: room.durationSeconds, theme: room.theme });
      this.gameTimer.startTimer(
        room,
        (time) => this.server.to(room.roomCode).emit('game:tick', { time, leaderboard: room.getLeaderboard() }),
        () => this.server.to(room.roomCode).emit('game:ended', { finalLeaderboard: room.getLeaderboard() }),
      );
    }, 10000);
    return { success: true };
  }

  @SubscribeMessage('player:set_password')
  handleSetPassword(@ConnectedSocket() client: Socket, @MessageBody() d: { password: string }) {
    const p = this.rooms.getRoomBySocket(client.id)?.players.get(client.id);
    if (p) p.password = d.password;
    return { acknowledged: true };
  }

  @SubscribeMessage('quiz:request_question') handleRequestQuestion(@ConnectedSocket() c: Socket) { return this.actions.requestQuestion(c); }
  @SubscribeMessage('quiz:submit_answer') handleSubmitAnswer(@ConnectedSocket() c: Socket, @MessageBody() d: any) { return this.actions.submitAnswer(c, d); }
  @SubscribeMessage('cards:pick') handlePickCard(@ConnectedSocket() c: Socket, @MessageBody() d: any) { return this.actions.pickCard(this.server, c, d); }
  @SubscribeMessage('hack:guess_password') handleHackGuess(@ConnectedSocket() c: Socket, @MessageBody() d: any) { return this.actions.hackGuess(this.server, c, d); }
  @SubscribeMessage('hack:defense_complete') handleDefenseComplete(@ConnectedSocket() c: Socket) { this.actions.defenseComplete(this.server, c); }
  @SubscribeMessage('hack:timeout') handleHackTimeout(@ConnectedSocket() c: Socket, @MessageBody() d: any) { return this.actions.hackTimeout(this.server, c, d); }
}

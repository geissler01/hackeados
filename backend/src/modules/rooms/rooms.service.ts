import { Injectable, Logger } from '@nestjs/common';
import { GameRoom } from './models/game-room.model';
import { PlayerLiveState } from './models/player-state.model';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  private rooms: Map<string, GameRoom> = new Map();
  private socketToRoom: Map<string, string> = new Map();

  createRoom(hostSocketId: string, dto: CreateRoomDto): GameRoom {
    const code = this.generateUniqueRoomCode();
    const room = new GameRoom(code, hostSocketId, dto.categoryId, dto.durationSeconds);
    if (dto.theme) room.theme = dto.theme;
    if (dto.isHostPlaying) {
      const nick = (dto.hostNickname || 'HOST').trim().toUpperCase().slice(0, 20);
      room.players.set(hostSocketId, new PlayerLiveState(hostSocketId, nick, dto.hostAvatarId || 1));
    }
    this.rooms.set(code, room);
    this.socketToRoom.set(hostSocketId, code);
    this.logger.log(`Sala creada: ${code} por Host: ${hostSocketId}`);
    return room;
  }

  canStart(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    return !!room && room.players.size >= 2;
  }

  joinRoom(socketId: string, dto: JoinRoomDto): { room: GameRoom; player: PlayerLiveState } {
    const room = this.rooms.get(dto.roomCode.toUpperCase());
    if (!room) throw new Error('La sala no existe o ha expirado');
    if (room.status !== 'LOBBY') throw new Error('La partida ya ha comenzado');
    if (room.players.size >= 40) throw new Error('La sala ha alcanzado el cupo máximo (40)');

    const player = new PlayerLiveState(socketId, dto.nickname, dto.avatarId);
    room.players.set(socketId, player);
    this.socketToRoom.set(socketId, room.roomCode);
    return { room, player };
  }

  updateConfig(code: string, hostId: string, cat?: string, dur?: number, theme?: any): GameRoom | null {
    const r = this.getRoom(code);
    if (!r || r.hostSocketId !== hostId || r.status !== 'LOBBY') return null;
    if (cat) r.categoryId = cat;
    if (dur) { r.durationSeconds = dur; r.timeRemaining = dur; }
    if (theme) r.theme = theme;
    return r;
  }

  setHostPlayerRole(code: string, hostId: string, playing: boolean, nick?: string, av?: number): GameRoom | null {
    const room = this.getRoom(code);
    if (!room || room.hostSocketId !== hostId) return null;
    if (playing) {
      room.players.set(hostId, new PlayerLiveState(hostId, (nick || 'HOST').trim().toUpperCase().slice(0, 20), av || 1));
    } else {
      room.players.delete(hostId);
    }
    return room;
  }

  leaveRoom(socketId: string): { room: GameRoom; wasHost: boolean; nextHost?: PlayerLiveState } | null {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;
    const room = this.rooms.get(code);
    if (!room) return null;

    const wasHost = room.hostSocketId === socketId;
    room.players.delete(socketId);
    this.socketToRoom.delete(socketId);

    let nextHost: PlayerLiveState | undefined;
    if (wasHost) {
      nextHost = Array.from(room.players.values()).find((p) => p.connected);
      if (nextHost) room.hostSocketId = nextHost.socketId;
      else this.destroyRoom(room.roomCode);
    }
    return { room, wasHost, nextHost };
  }

  reconnectHost(code: string, newId: string): GameRoom | null {
    const room = this.getRoom(code);
    if (!room) return null;
    this.socketToRoom.delete(room.hostSocketId);
    room.hostSocketId = newId;
    this.socketToRoom.set(newId, room.roomCode);
    return room;
  }

  reconnectPlayer(code: string, nick: string, newId: string): { room: GameRoom; player: PlayerLiveState } | null {
    const room = this.getRoom(code);
    if (!room) return null;
    const entry = Array.from(room.players.entries()).find(([_, p]) => p.nickname === nick.toUpperCase());
    if (!entry) return null;
    const [oldId, player] = entry;
    room.players.delete(oldId);
    this.socketToRoom.delete(oldId);
    player.socketId = newId;
    player.connected = true;
    room.players.set(newId, player);
    this.socketToRoom.set(newId, room.roomCode);
    return { room, player };
  }

  getRoom(code: string): GameRoom | undefined { return this.rooms.get(code.toUpperCase()); }
  getRoomBySocket(id: string): GameRoom | undefined { const c = this.socketToRoom.get(id); return c ? this.rooms.get(c) : undefined; }

  destroyRoom(code: string): void {
    const r = this.rooms.get(code.toUpperCase());
    if (r) {
      this.socketToRoom.delete(r.hostSocketId);
      for (const sId of r.players.keys()) this.socketToRoom.delete(sId);
      this.rooms.delete(r.roomCode);
    }
  }

  private generateUniqueRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
    while (this.rooms.has(code));
    return code;
  }
}

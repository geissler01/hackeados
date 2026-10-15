import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../../rooms/rooms.service';
import { RoomDisconnectionService } from '../../rooms/services/room-disconnection.service';

@Injectable()
export class GameDisconnectHandlerService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly disconnectService: RoomDisconnectionService,
  ) {}

  handleDisconnect(server: Server, client: Socket): void {
    const room = this.roomsService.getRoomBySocket(client.id);
    if (!room) return;

    if (room.hostSocketId === client.id) {
      this.disconnectService.scheduleHostGrace(
        room,
        (newHost) => {
          server.to(room.roomCode).emit('room:host_promoted', { newHostId: newHost.socketId, newHostNickname: newHost.nickname });
          server.to(room.roomCode).emit('room:players_updated', { players: Array.from(room.players.values()), hostSocketId: room.hostSocketId });
        },
        () => {
          server.to(room.roomCode).emit('room:closed', { reason: 'Sala abandonada tras 5 minutos' });
          this.roomsService.destroyRoom(room.roomCode);
        },
      );
    }

    const player = room.players.get(client.id);
    if (player) {
      player.connected = false;
      player.disconnectedAt = Date.now();
      server.to(room.roomCode).emit('room:players_updated', {
        players: Array.from(room.players.values()),
        hostSocketId: room.hostSocketId,
      });
    }

    const hasConnectedPlayers = Array.from(room.players.values()).some((p) => p.connected);
    if (!hasConnectedPlayers) {
      this.disconnectService.scheduleAbandoned(room, () => {
        server.to(room.roomCode).emit('room:closed', { reason: 'Sala abandonada tras 5 minutos' });
        this.roomsService.destroyRoom(room.roomCode);
      });
    }
  }
}

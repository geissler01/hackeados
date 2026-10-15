import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomDisconnectionService } from './services/room-disconnection.service';

@Module({
  providers: [RoomsService, RoomDisconnectionService],
  exports: [RoomsService, RoomDisconnectionService],
})
export class RoomsModule {}

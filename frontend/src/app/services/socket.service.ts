import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AppConfig } from './config';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  readonly isConnected = signal(false);

  constructor() {
    this.socket = io(AppConfig.socketUrl, { autoConnect: true });

    this.socket.on('connect', () => this.isConnected.set(true));
    this.socket.on('disconnect', () => this.isConnected.set(false));
  }

  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  emitWithAck<T>(event: string, data?: any): Promise<T> {
    return new Promise((resolve) => {
      this.socket.emit(event, data, (response: T) => resolve(response));
    });
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.socket.on(event, callback);
  }

  off(event: string): void {
    this.socket.off(event);
  }

  get socketId(): string | undefined {
    return this.socket.id;
  }
}

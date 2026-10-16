import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SocketService } from '../services/socket.service';
import { AvatarService } from '../services/avatar.service';
import { GameTickerComponent, TickerMessage } from '../components/game-ticker.component';
import { MatchSummaryComponent } from '../components/match-summary.component';
import { RoomSettingsComponent, RoomConfig } from '../components/room-settings.component';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [CommonModule, FormsModule, GameTickerComponent, MatchSummaryComponent, RoomSettingsComponent],
  templateUrl: './host.page.html',
  styleUrls: ['./host.page.css'],
})
export class HostPage implements OnInit {
  readonly roomCode = signal('');
  readonly status = signal<'LOBBY' | 'PASSWORD_SETUP' | 'PLAYING' | 'ENDED'>('LOBBY');
  readonly players = signal<any[]>([]);
  readonly leaderboard = signal<any[]>([]);
  readonly timeRemaining = signal(300);
  readonly setupCountdown = signal(10);
  readonly mode = signal<'OBSERVER' | 'PLAYER'>('OBSERVER');
  readonly isJoined = signal(false);
  readonly hostAvatarId = signal(1);
  readonly categoryId = signal('tecnologia');
  readonly durationSeconds = signal(300);
  readonly theme = signal<'matrix-emerald' | 'cyber-arcade' | 'amber-crt'>('matrix-emerald');
  readonly tickerMessages = signal<TickerMessage[]>([]);
  readonly questionsCount = signal(0);
  readonly questionsTarget = signal(100);
  readonly minRequired = signal(50);
  hostNickname = 'ANFITRION';

  constructor(private socket: SocketService, private avatar: AvatarService, private sanitizer: DomSanitizer, private router: Router) {}

  ngOnInit(): void {
    this.socket.on('connect', () => this.initOrReconnect());
    if (this.socket.isConnected()) this.initOrReconnect();
    this.socket.on<any>('room:players_updated', (d) => this.players.set(d.players || []));
    this.socket.on<any>('room:questions_progress', (d) => {
      this.questionsCount.set(d.current || 0);
      this.questionsTarget.set(d.target || 100);
      this.minRequired.set(d.minRequired || 50);
    });
    this.socket.on<any>('game:setup_passwords', (d) => {
      this.status.set('PASSWORD_SETUP');
      this.setupCountdown.set(d.durationSeconds || 10);
      const t = setInterval(() => { this.setupCountdown.update((c) => (c > 1 ? c - 1 : 0)); if (this.setupCountdown() <= 0) clearInterval(t); }, 1000);
    });
    this.socket.on('game:started', () => this.status.set('PLAYING'));
    this.socket.on<any>('game:tick', (d) => {
      this.timeRemaining.set(d.time);
      this.leaderboard.set(d.leaderboard || []);
      if (d.time <= 0) this.status.set('ENDED');
    });
    this.socket.on<any>('game:event_broadcast', (msg) => this.tickerMessages.update((m) => [...m.slice(-9), msg]));
    this.socket.on('room:closed', () => this.goHome());
    this.socket.on<any>('game:ended', (d) => { this.status.set('ENDED'); if (d?.finalLeaderboard) this.leaderboard.set(d.finalLeaderboard); });
  }

  async initOrReconnect(): Promise<void> {
    const saved = sessionStorage.getItem('hackeados_host_code');
    if (saved) {
      const res: any = await this.socket.emitWithAck('room:reconnect', { roomCode: saved, role: 'host' });
      if (res?.success) {
        if (res.status === 'ENDED') {
          this.status.set('ENDED');
          if (res.players) this.leaderboard.set(res.players.sort((a: any, b: any) => b.score - a.score));
          return;
        }
        this.roomCode.set(res.roomCode); this.status.set(res.status); this.players.set(res.players || []);
        if (res.theme) { this.theme.set(res.theme); document.documentElement.setAttribute('data-theme', res.theme); }
        return;
      }
      sessionStorage.removeItem('hackeados_host_code');
    }
    this.createRoom();
  }

  async createRoom(): Promise<void> {
    const res: any = await this.socket.emitWithAck('room:create', {
      categoryId: this.categoryId(), durationSeconds: this.durationSeconds(), theme: this.theme(), isHostPlaying: false,
    });
    if (res?.roomCode) { this.roomCode.set(res.roomCode); sessionStorage.setItem('hackeados_host_code', res.roomCode); }
  }

  onConfigChange(cfg: RoomConfig): void {
    if (cfg.categoryId !== this.categoryId()) {
      this.questionsCount.set(0);
    }
    this.categoryId.set(cfg.categoryId); this.durationSeconds.set(cfg.durationSeconds); this.theme.set(cfg.theme);
    this.socket.emit('room:update_config', { roomCode: this.roomCode(), ...cfg });
  }

  async setMode(m: 'OBSERVER' | 'PLAYER'): Promise<void> {
    this.mode.set(m);
    if (m === 'OBSERVER' && this.isJoined()) {
      await this.socket.emitWithAck('room:host_set_role', { roomCode: this.roomCode(), isHostPlaying: false });
      this.isJoined.set(false);
    }
  }

  async confirmJoin(): Promise<void> {
    const nick = this.hostNickname.trim().toUpperCase() || 'ANFITRION';
    const res: any = await this.socket.emitWithAck('room:host_set_role', {
      roomCode: this.roomCode(), isHostPlaying: true, nickname: nick, avatarId: this.hostAvatarId(),
    });
    if (res?.success) this.isJoined.set(true);
  }

  prevAvatar(): void { this.hostAvatarId.update((v) => (v > 1 ? v - 1 : 20)); }
  nextAvatar(): void { this.hostAvatarId.update((v) => (v < 20 ? v + 1 : 1)); }
  currentAvatarSvg(): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.avatar.getAvatarSvg(this.hostAvatarId())); }
  getAvatar(id: number): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.avatar.getAvatarSvg(id)); }
  getQrUrl(): string {
    const url = encodeURIComponent(`https://hackeados.geislera.com/join?pin=${this.roomCode()}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${url}`;
  }

  canStart(): boolean {
    return this.players().length >= 2 && this.questionsCount() >= this.minRequired();
  }

  async onStartGame(): Promise<void> {
    if (!this.canStart()) return;
    if (this.mode() === 'PLAYER') {
      await this.router.navigate(['/play', this.roomCode()], {
        queryParams: { nick: this.hostNickname.trim().toUpperCase(), avatar: this.hostAvatarId() },
      });
    }
    this.socket.emit('game:start', { roomCode: this.roomCode() });
  }

  goHome(): void { sessionStorage.removeItem('hackeados_host_code'); this.router.navigate(['/']); }
}

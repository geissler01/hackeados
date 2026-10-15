import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SocketService } from '../services/socket.service';
import { AvatarService } from '../services/avatar.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="join-container">
      <div class="join-card">
        <div class="card-top-nav">
          <button class="btn-back font-mono" (click)="goHome()">← [ VOLVER AL INICIO ]</button>
        </div>
        <h2 class="title font-mono">> ACCESO A SALA _</h2>
        <div class="avatar-selector">
          <button class="nav-btn font-mono" (click)="prevAvatar()">[ < ]</button>
          <div class="avatar-box" [innerHTML]="currentAvatarSvg()"></div>
          <button class="nav-btn font-mono" (click)="nextAvatar()">[ > ]</button>
        </div>
        <div class="fields">
          <label class="font-mono">PIN DE SALA (6 DÍGITOS):</label>
          <input [(ngModel)]="roomCode" placeholder="Ej: K7X2P9" maxlength="6" class="cyber-input font-mono" />
          <div class="label-row font-mono"><span>TU APODO:</span><span class="count">{{ nickname.length }}/20</span></div>
          <input [(ngModel)]="nickname" placeholder="CYBER_HACKER_99" maxlength="20" class="cyber-input font-mono" />
        </div>
        @if (errorMessage()) { <p class="error-msg font-mono">{{ errorMessage() }}</p> }
        <button class="btn-cyber btn-connect font-mono" [disabled]="!canJoin()" (click)="onJoin()">
          [ UNIRSE AL LOBBY ]
        </button>
      </div>
    </div>
  `,
  styles: [`
    .join-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; box-sizing: border-box; }
    .join-card { width: 100%; max-width: 400px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px 18px; text-align: center; box-sizing: border-box; }
    .card-top-nav { display: flex; margin-bottom: 16px; }
    .btn-back { background: none; border: 1px solid var(--border-subtle); color: var(--accent-primary); font-size: 11px; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
    .btn-back:hover { background: rgba(0, 255, 136, 0.1); border-color: var(--accent-primary); }
    .title { font-size: 20px; color: var(--accent-primary); margin-bottom: 16px; }
    .avatar-selector { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 18px; }
    .nav-btn { background: none; border: 1px solid var(--border-subtle); color: var(--accent-primary); font-size: 18px; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    .avatar-box { width: 80px; height: 80px; }
    .fields { display: flex; flex-direction: column; gap: 8px; text-align: left; margin-bottom: 18px; font-size: 11px; color: var(--text-muted); }
    .label-row { display: flex; justify-content: space-between; }
    .count { color: var(--accent-primary); }
    .cyber-input { background: var(--bg-app); border: 1px solid var(--border-subtle); color: var(--text-primary); padding: 12px; font-size: 15px; border-radius: 6px; text-transform: uppercase; outline: none; width: 100%; box-sizing: border-box; }
    .error-msg { color: var(--accent-danger); font-size: 12px; margin-bottom: 12px; }
    .btn-connect { width: 100%; background: var(--accent-primary); color: var(--bg-app); min-height: 50px; font-size: 15px; }
  `],
})
export class JoinPage implements OnInit {
  roomCode = ''; nickname = '';
  readonly avatarId = signal(1); readonly errorMessage = signal('');

  constructor(
    private route: ActivatedRoute, private router: Router, private socket: SocketService,
    private avatarService: AvatarService, private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    const pin = this.route.snapshot.queryParamMap.get('pin');
    if (pin) this.roomCode = pin.toUpperCase();
  }

  currentAvatarSvg(): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.avatarService.getAvatarSvg(this.avatarId())); }
  prevAvatar(): void { this.avatarId.update((v) => (v > 1 ? v - 1 : 20)); }
  nextAvatar(): void { this.avatarId.update((v) => (v < 20 ? v + 1 : 1)); }
  canJoin(): boolean { return this.roomCode.length === 6 && this.nickname.trim().length > 0; }
  goHome(): void { this.router.navigate(['/']); }

  async onJoin(): Promise<void> {
    this.errorMessage.set('');
    try {
      const res: any = await this.socket.emitWithAck('room:join', {
        roomCode: this.roomCode.toUpperCase(), nickname: this.nickname.trim().toUpperCase(), avatarId: this.avatarId(),
      });
      if (res?.success) {
        this.router.navigate(['/play', this.roomCode.toUpperCase()], {
          queryParams: { nick: this.nickname.trim().toUpperCase(), avatar: this.avatarId() },
        });
      } else {
        this.errorMessage.set(res?.message || 'No se pudo conectar a la sala');
      }
    } catch {
      this.errorMessage.set('Error conectando con el servidor');
    }
  }
}

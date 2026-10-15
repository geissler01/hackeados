import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarService } from '../services/avatar.service';

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  avatarId: number;
  score: number;
  accuracy: number;
}

@Component({
  selector: 'app-match-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-container">
      <h2 class="title font-mono">> RESUMEN DE LA PARTIDA _</h2>
      <div class="podium-row">
        @for (entry of topThree; track entry.nickname) {
          <div class="podium-card rank-{{ entry.rank }}" [class.is-me]="isMe(entry.nickname)">
            <div class="rank-badge font-mono">#{{ entry.rank }}</div>
            <div class="avatar-box" [innerHTML]="getAvatar(entry.avatarId)"></div>
            <div class="nick font-mono">{{ entry.nickname }}</div>
            <div class="score font-mono">{{ entry.score.toLocaleString() }} PTS</div>
            @if (isMe(entry.nickname)) { <div class="me-tag font-mono">[ TÚ ]</div> }
          </div>
        }
      </div>
      @if (remainingPlayers.length > 0) {
        <div class="rest-list">
          <div class="rest-header font-mono">CLASIFICACIÓN COMPLETA:</div>
          @for (entry of remainingPlayers; track entry.nickname) {
            <div class="player-row" [class.is-me]="isMe(entry.nickname)">
              <span class="row-rank font-mono">#{{ entry.rank }}</span>
              <div class="row-avatar" [innerHTML]="getAvatar(entry.avatarId)"></div>
              <span class="row-nick font-mono">{{ entry.nickname }}</span>
              @if (isMe(entry.nickname)) { <span class="me-pill font-mono">[ TÚ ]</span> }
              <span class="row-score font-mono">{{ entry.score.toLocaleString() }} PTS</span>
            </div>
          }
        </div>
      }
      <div class="auto-timer font-mono">Redirigiendo a inicio en <span>{{ countdown() }}s</span></div>
      <button class="btn-cyber btn-home font-mono" (click)="onHomeClick()">[ VOLVER AL INICIO ]</button>
    </div>
  `,
  styleUrls: ['./match-summary.component.css'],
})
export class MatchSummaryComponent implements OnInit, OnDestroy {
  @Input() leaderboard: LeaderboardEntry[] = [];
  @Input() myNickname: string = '';
  @Output() home = new EventEmitter<void>();

  readonly countdown = signal(120);
  private timer?: any;
  private targetEndTime = 0;
  private visibilityHandler = () => this.syncCountdown();

  constructor(private avatarService: AvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.targetEndTime = Date.now() + 120 * 1000;
    this.syncCountdown();
    this.timer = setInterval(() => this.syncCountdown(), 1000);
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('focus', this.visibilityHandler);
  }

  private syncCountdown(): void {
    const remaining = Math.max(0, Math.ceil((this.targetEndTime - Date.now()) / 1000));
    this.countdown.set(remaining);
    if (remaining <= 0) {
      this.cleanup();
      this.home.emit();
    }
  }

  private cleanup(): void {
    if (this.timer) clearInterval(this.timer);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('focus', this.visibilityHandler);
  }

  ngOnDestroy(): void { this.cleanup(); }
  get topThree(): LeaderboardEntry[] { return this.leaderboard.slice(0, 3); }
  get remainingPlayers(): LeaderboardEntry[] { return this.leaderboard.slice(3); }
  isMe(nick: string): boolean { return !!this.myNickname && nick.toUpperCase() === this.myNickname.toUpperCase(); }
  getAvatar(id: number): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.avatarService.getAvatarSvg(id)); }
  onHomeClick(): void { this.cleanup(); this.home.emit(); }
}

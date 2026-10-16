import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SocketService } from '../services/socket.service';
import { AvatarService } from '../services/avatar.service';
import { AudioService } from '../services/audio.service';
import { HapticsService } from '../services/haptics.service';
import { PlayerDuelService } from '../services/player-duel.service';
import { PlayerQuizService } from '../services/player-quiz.service';
import { CardsPickerComponent } from '../components/cards-picker.component';
import { DefenseMatrixComponent } from '../components/defense/matrix-defense.component';
import { DefenseSimonComponent } from '../components/defense/simon-defense.component';
import { DefenseSliderComponent } from '../components/defense/slider-defense.component';
import { GameTickerComponent, TickerMessage } from '../components/game-ticker.component';
import { MatchSummaryComponent } from '../components/match-summary.component';

@Component({
  selector: 'app-player', standalone: true,
  imports: [CommonModule, CardsPickerComponent, DefenseMatrixComponent, DefenseSimonComponent, DefenseSliderComponent, GameTickerComponent, MatchSummaryComponent],
  templateUrl: './player.page.html', styleUrls: ['./player.page.css'],
})
export class PlayerPage implements OnInit {
  private route = inject(ActivatedRoute); private router = inject(Router); private socket = inject(SocketService);
  private avatar = inject(AvatarService); private audio = inject(AudioService); private haptics = inject(HapticsService);
  private sanitizer = inject(DomSanitizer); private duel = inject(PlayerDuelService); private quiz = inject(PlayerQuizService);

  roomCode = ''; nickname = '';
  readonly isHost = signal(false); readonly avatarId = signal(1); readonly timeRemaining = signal(300);
  readonly currentView = signal<'LOBBY' | 'PASSWORDS' | 'QUIZ' | 'CARDS' | 'HACKING' | 'DEFENDING' | 'ENDED'>('LOBBY');
  readonly connectedPlayers = signal<any[]>([]); readonly leaderboard = signal<any[]>([]);
  readonly tickerMessages = signal<TickerMessage[]>([]); readonly passwordOptions = signal<string[]>([]);
  readonly selectedPassword = signal(''); readonly passwordCountdown = signal(10);
  readonly floatingPoints = signal<number | null>(null);
  readonly questionsCount = signal(0);
  readonly questionsTarget = signal(100);
  readonly minRequired = signal(50);
  readonly score = this.quiz.score; readonly currentQuestion = this.quiz.currentQuestion;
  readonly hackCountdown = this.duel.hackCountdown; readonly hackOptions = this.duel.hackOptions;
  readonly victimMinigame = this.duel.victimMinigame;
  private pwdTimer?: any;

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode') || sessionStorage.getItem('hackeados_play_room') || '';
    this.nickname = this.route.snapshot.queryParamMap.get('nick') || sessionStorage.getItem('hackeados_play_nick') || '';
    this.avatarId.set(parseInt(this.route.snapshot.queryParamMap.get('avatar') || sessionStorage.getItem('hackeados_play_av') || '1', 10));
    sessionStorage.setItem('hackeados_play_room', this.roomCode); sessionStorage.setItem('hackeados_play_nick', this.nickname);
    this.bindSocketEvents();
    this.socket.emitWithAck('room:reconnect', { roomCode: this.roomCode, role: 'player', nickname: this.nickname }).then((res: any) => {
      if (!res?.success) { this.goHome(); return; }
      if (res.status === 'ENDED') {
        if (res.players) this.leaderboard.set(res.players.sort((a: any, b: any) => b.score - a.score));
        this.currentView.set('ENDED');
        return;
      }
      if (res.players) this.connectedPlayers.set(res.players);
      if (res.isHost) this.isHost.set(true);
      if (res.theme) document.documentElement.setAttribute('data-theme', res.theme);
      if (res.status === 'PASSWORD_SETUP') this.startPasswordSetup({ options: res.options, durationSeconds: 10 });
      else if (res.status === 'PLAYING') this.quiz.requestNextQuestion().then(() => this.setView('QUIZ'));
    });
  }

  private setView(view: 'LOBBY' | 'PASSWORDS' | 'QUIZ' | 'CARDS' | 'HACKING' | 'DEFENDING' | 'ENDED'): void {
    if (this.currentView() === 'ENDED') return;
    this.currentView.set(view);
  }

  private bindSocketEvents(): void {
    this.socket.on('room:closed', () => this.goHome());
    this.socket.on<any>('room:players_updated', (d) => { this.connectedPlayers.set(d.players || []); if (d.hostSocketId && this.socket.socketId === d.hostSocketId) this.isHost.set(true); if (d.theme) document.documentElement.setAttribute('data-theme', d.theme); });
    this.socket.on<any>('room:questions_progress', (d) => {
      this.questionsCount.set(d.current || 0);
      this.questionsTarget.set(d.target || 100);
      this.minRequired.set(d.minRequired || 50);
    });
    this.socket.on<any>('room:config_updated', (d) => { if (d?.theme) document.documentElement.setAttribute('data-theme', d.theme); });
    this.socket.on<any>('game:setup_passwords', (d) => this.startPasswordSetup(d));
    this.socket.on<any>('game:started', (d) => { if (d?.theme) document.documentElement.setAttribute('data-theme', d.theme); clearInterval(this.pwdTimer); this.quiz.requestNextQuestion().then(() => this.setView('QUIZ')); });
    this.socket.on<any>('game:tick', (d) => {
      this.timeRemaining.set(d.time);
      if (d.leaderboard) this.leaderboard.set(d.leaderboard);
      if (d.time <= 0) { clearInterval(this.pwdTimer); this.currentView.set('ENDED'); }
    });
    this.socket.on<any>('game:event_broadcast', (msg) => this.tickerMessages.update((m) => [...m.slice(-9), msg]));
    this.socket.on<any>('hack:alert_victim', (d) => { if (this.currentView() === 'ENDED') return; this.duel.triggerDefense(d.minigameType); this.setView('DEFENDING'); });
    this.socket.on<any>('hack:defense_cleared', () => { if (this.currentView() === 'ENDED') return; this.audio.playCorrect(); this.setView('QUIZ'); this.quiz.requestNextQuestion(); });
    this.socket.on<any>('hack:aborted', () => { if (this.currentView() === 'ENDED') return; this.duel.cancelHacking(); this.audio.playWrong(); this.setView('QUIZ'); this.quiz.requestNextQuestion(); });
    this.socket.on<any>('hack:breach_confirmed', (d) => { if (this.currentView() === 'ENDED') return; this.haptics.error(); this.audio.playWrong(); if (d?.stolenPoints) { this.score.update((s) => Math.max(0, s - d.stolenPoints)); this.triggerFloating(-d.stolenPoints); } this.setView('QUIZ'); this.quiz.requestNextQuestion(); });
    this.socket.on<any>('game:ended', (d) => { clearInterval(this.pwdTimer); this.currentView.set('ENDED'); if (d?.finalLeaderboard) this.leaderboard.set(d.finalLeaderboard); });
  }

  canStart(): boolean { return this.connectedPlayers().length >= 2; }
  onStartGame(): void { if (this.canStart()) this.socket.emit('game:start', { roomCode: this.roomCode }); }
  getAvatar(id: number): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.avatar.getAvatarSvg(id)); }
  selectPassword(pwd: string): void { this.selectedPassword.set(pwd); this.socket.emit('player:set_password', { password: pwd }); }

  startPasswordSetup(d: any): void {
    if (this.currentView() === 'PASSWORDS' || this.currentView() === 'ENDED') return;
    clearInterval(this.pwdTimer);
    this.passwordOptions.set(d.options || []); this.passwordCountdown.set(d.durationSeconds || 10); this.setView('PASSWORDS');
    this.pwdTimer = setInterval(() => this.passwordCountdown.update((c) => (c > 0 ? c - 1 : 0)), 1000);
  }

  async submitAnswer(idx: number): Promise<void> {
    if (this.currentView() === 'ENDED' || this.timeRemaining() <= 0) return;
    if (await this.quiz.submitAnswer(this.currentQuestion().id, idx)) this.setView('CARDS');
    else setTimeout(() => { if (this.currentView() !== 'ENDED') this.quiz.requestNextQuestion(); }, 1800);
  }

  async onPickCard(slot: number, picker: CardsPickerComponent): Promise<void> {
    if (this.currentView() === 'ENDED' || this.timeRemaining() <= 0) return;
    const prevScore = this.score();
    const res = await this.quiz.pickCard(slot);
    if (!res) return;
    const diff = (res.newScore ?? prevScore) - prevScore;
    if (diff !== 0) this.triggerFloating(diff);
    picker.reveal(res.allCards || [res.reward]);
    setTimeout(() => {
      if (this.currentView() === 'ENDED') return;
      if (res.reward.type === 'HACK' && res.hackData) {
        this.setView('HACKING');
        this.duel.startHacking(res.hackData, () => { if (this.currentView() !== 'ENDED') { this.setView('QUIZ'); this.quiz.requestNextQuestion(); } });
      } else { this.setView('QUIZ'); this.quiz.requestNextQuestion(); }
    }, 2000);
  }

  async submitHackGuess(guess: string): Promise<void> {
    const res = await this.duel.submitGuess(guess);
    const stolen = res?.stolenPoints || 0;
    if (res?.success && stolen > 0) {
      this.score.update((s) => s + stolen);
      this.triggerFloating(stolen);
      this.audio.playCorrect();
    } else {
      this.audio.playWrong();
    }
    if (this.currentView() !== 'ENDED') { this.setView('QUIZ'); this.quiz.requestNextQuestion(); }
  }

  onDefenseSuccess(): void { this.duel.completeDefense(); if (this.currentView() !== 'ENDED') { this.setView('QUIZ'); this.quiz.requestNextQuestion(); } }
  private triggerFloating(pts: number): void { this.floatingPoints.set(pts); setTimeout(() => this.floatingPoints.set(null), 1400); }
  async goHome(): Promise<void> { try { await this.socket.emitWithAck('room:leave'); } catch {} sessionStorage.clear(); this.router.navigate(['/']); }
}

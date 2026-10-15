import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { JoinPage } from './pages/join.page';
import { HostPage } from './pages/host.page';
import { PlayerPage } from './pages/player.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'join', component: JoinPage },
  { path: 'host', component: HostPage },
  { path: 'play/:roomCode', component: PlayerPage },
  { path: '**', redirectTo: '' },
];

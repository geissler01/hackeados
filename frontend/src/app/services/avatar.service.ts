import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly seeds = [
    'CyberBot', 'MatrixZero', 'QuantumX', 'NeonByte',
    'RoboHacker', 'Mainframe99', 'CipherPulse', 'KernelRoot',
    'ShadowNet', 'GlitchBot', 'VortexAI', 'AlphaCircuit',
    'DeltaDrone', 'OmegaSecurity', 'Synapse404', 'GhostProtocol',
    'TitanCore', 'FluxNode', 'CyberSkull', 'NanoGuardian'
  ];

  getAvatarUrl(avatarId: number): string {
    const id = Math.min(Math.max(avatarId, 1), 20);
    const seed = this.seeds[id - 1];
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}&radius=16&backgroundColor=12181c`;
  }

  getAvatarSvg(avatarId: number): string {
    const id = Math.min(Math.max(avatarId, 1), 20);
    const seed = this.seeds[id - 1];
    const url = this.getAvatarUrl(id);
    return `<img src="${url}" alt="${seed}" class="avatar-sticker" style="width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 0 6px rgba(0,255,136,0.3));" />`;
  }
}

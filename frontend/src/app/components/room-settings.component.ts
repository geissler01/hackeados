import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RoomConfig {
  categoryId: string;
  durationSeconds: number;
  theme: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt';
}

export interface CategoryOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-room-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-settings.component.html',
  styleUrls: ['./room-settings.component.css'],
})
export class RoomSettingsComponent {
  @Input() categoryId = 'tecnologia';
  @Input() durationSeconds = 300;
  @Input() theme: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt' = 'matrix-emerald';
  @Output() configChange = new EventEmitter<RoomConfig>();

  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');
  readonly tempCategoryId = signal('tecnologia');

  readonly categories: CategoryOption[] = [
    { id: 'tecnologia', label: 'Ciberseguridad & Redes', desc: 'Hacking, protocolos, criptografía, terminal', icon: '💻' },
    { id: 'cultura_general', label: 'Cultura General', desc: 'Historia, geografía, arte, literatura y cine', icon: '🌍' },
    { id: 'ciencia', label: 'Ciencia & Naturaleza', desc: 'Astronomía, física, química y biología', icon: '🔬' },
    { id: 'programacion', label: 'Desarrollo de Software', desc: 'Algoritmos, estructuras de datos, código', icon: '⚡' },
    { id: 'videojuegos', label: 'Cultura Arcade & Gaming', desc: 'Historia del gaming, consolas, títulos retro', icon: '🕹️' },
    { id: 'ia_tech', label: 'Inteligencia Artificial', desc: 'Machine Learning, redes neuronales, modelos', icon: '🤖' },
  ];

  readonly durations = [
    { seconds: 180, label: '3 MIN' },
    { seconds: 300, label: '5 MIN' },
    { seconds: 420, label: '7 MIN' },
    { seconds: 600, label: '10 MIN' },
  ];

  readonly themes = [
    { id: 'matrix-emerald', label: 'Matrix', icon: '🟢' },
    { id: 'cyber-arcade', label: 'Arcade', icon: '🔵' },
    { id: 'amber-crt', label: 'Amber', icon: '🟠' },
  ] as const;

  get currentCategory(): CategoryOption {
    return this.categories.find((c) => c.id === this.categoryId) || this.categories[0];
  }

  get filteredCategories(): CategoryOption[] {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.filter((c) => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }

  openModal(): void {
    this.tempCategoryId.set(this.categoryId);
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void { this.isModalOpen.set(false); }

  selectTemp(id: string): void { this.tempCategoryId.set(id); }

  confirmCategory(): void {
    this.categoryId = this.tempCategoryId();
    this.closeModal();
    this.emitChange();
  }

  setDuration(sec: number): void { this.durationSeconds = sec; this.emitChange(); }

  setTheme(thm: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt'): void {
    this.theme = thm;
    document.documentElement.setAttribute('data-theme', thm);
    this.emitChange();
  }

  private emitChange(): void {
    this.configChange.emit({ categoryId: this.categoryId, durationSeconds: this.durationSeconds, theme: this.theme });
  }
}

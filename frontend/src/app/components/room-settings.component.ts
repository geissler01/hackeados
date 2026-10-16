import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfig } from '../services/config';

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
export class RoomSettingsComponent implements OnInit {
  @Input() categoryId = 'tecnologia';
  @Input() durationSeconds = 300;
  @Input() theme: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt' = 'matrix-emerald';
  @Output() configChange = new EventEmitter<RoomConfig>();

  readonly isModalOpen = signal(false);
  readonly searchQuery = signal('');
  readonly tempCategoryId = signal('tecnologia');

  categories: CategoryOption[] = [
    { id: 'tecnologia', label: 'Tecnología & Ciberseguridad', desc: 'Hacking ético, programación, redes, hardware y sistemas', icon: '💻' },
    { id: 'cultura_general', label: 'Cultura General & Curiosidades', desc: 'Mitos, literatura, inventos, datos insólitos y récords', icon: '🌍' },
    { id: 'ciencia', label: 'Ciencia & Naturaleza', desc: 'Astronomía, física, química, cuerpo humano y biología', icon: '🔬' },
    { id: 'entretenimiento', label: 'Entretenimiento & Pop Culture', desc: 'Cine clásico y moderno, series, superhéroes y animación', icon: '🎬' },
    { id: 'musica', label: 'Música & Ritmos del Mundo', desc: 'Rock, pop, salsa, vallenato, baladas e instrumentos', icon: '🎵' },
    { id: 'historia', label: 'Historia Universal', desc: 'Civilizaciones antiguas, guerras mundiales e independencia', icon: '🏛️' },
    { id: 'biblia', label: 'La Biblia & Relatos Sagrados', desc: 'Génesis, reyes, profetas, parábolas y vida de Jesús', icon: '📜' },
    { id: 'campo_agro', label: 'El Campo, Agro & Ganadería', desc: 'Café de Colombia, ganadería, frutas, flores y vida rural', icon: '🌱' },
    { id: 'deportes', label: 'Deportes & Campeonatos', desc: 'Fútbol mundial, ciclismo, Juegos Olímpicos y leyendas', icon: '⚽' },
    { id: 'geografia_mundo', label: 'Geografía & Países del Mundo', desc: 'Capitales, banderas, cordilleras, ríos y maravillas', icon: '🗺️' },
  ];

  ngOnInit(): void {
    fetch(`${AppConfig.socketUrl}/categories`)
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const iconMap: Record<string, string> = {
            tecnologia: '💻', cultura_general: '🌍', ciencia: '🔬',
            entretenimiento: '🎬', musica: '🎵', historia: '🏛️',
            biblia: '📜', campo_agro: '🌱', deportes: '⚽', geografia_mundo: '🗺️'
          };
          this.categories = data.map((c) => ({
            id: c.id,
            label: c.name,
            desc: c.description || '',
            icon: iconMap[c.id] || '💡',
          }));
        }
      })
      .catch(() => {});
  }

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

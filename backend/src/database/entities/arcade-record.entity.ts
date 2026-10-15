import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GameSession } from './game-session.entity';
import { Category } from './category.entity';

@Entity('arcade_leaderboard')
export class ArcadeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'game_session_id', type: 'uuid', nullable: true })
  gameSessionId: string;

  @ManyToOne(() => GameSession, (session) => session.records, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'game_session_id' })
  gameSession: GameSession;

  @Column({ name: 'category_id', type: 'varchar', length: 50, nullable: true })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'arcade_tag', type: 'varchar', length: 10, unique: true })
  arcadeTag: string;

  @Column({ type: 'bigint' })
  score: number;

  @Column({ name: 'accuracy_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  accuracyPercentage: number;

  @Column({ name: 'hacks_count', type: 'int', default: 0 })
  hacksCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { ArcadeRecord } from './arcade-record.entity';

@Entity('game_sessions')
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_code', type: 'varchar', length: 6 })
  roomCode: string;

  @Column({ name: 'category_id', type: 'varchar', length: 50 })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'total_players', type: 'int' })
  totalPlayers: number;

  @Column({ name: 'duration_seconds', type: 'int' })
  durationSeconds: number;

  @Column({ name: 'winner_nickname', type: 'varchar', length: 10, nullable: true })
  winnerNickname: string;

  @Column({ name: 'winner_score', type: 'bigint', nullable: true })
  winnerScore: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @CreateDateColumn({ name: 'ended_at' })
  endedAt: Date;

  @OneToMany(() => ArcadeRecord, (record) => record.gameSession)
  records: ArcadeRecord[];
}

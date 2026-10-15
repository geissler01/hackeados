import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { Subtopic } from './subtopic.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'varchar', length: 50 })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'subtopic_id', type: 'uuid', nullable: true })
  subtopicId: string;

  @ManyToOne(() => Subtopic, (subtopic) => subtopic.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subtopic_id' })
  subtopic: Subtopic;

  @Column({ name: 'question_text', type: 'text', unique: true })
  questionText: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column({ name: 'correct_index', type: 'smallint' })
  correctIndex: number;

  @Column({ type: 'varchar', length: 10, default: 'medium' })
  difficulty: string;

  @Column({ name: 'times_used', type: 'int', default: 0 })
  timesUsed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

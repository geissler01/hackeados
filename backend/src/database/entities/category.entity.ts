import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Subtopic } from './subtopic.entity';
import { Question } from './question.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'target_pool_size', type: 'int', default: 200 })
  targetPoolSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Subtopic, (subtopic) => subtopic.category)
  subtopics: Subtopic[];

  @OneToMany(() => Question, (question) => question.category)
  questions: Question[];
}

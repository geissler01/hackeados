import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Question } from './question.entity';

@Entity('subtopics')
export class Subtopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'varchar', length: 50 })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.subtopics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'prompt_keywords', type: 'text', nullable: true })
  promptKeywords: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Question, (question) => question.subtopic)
  questions: Question[];
}

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from '../database/entities/category.entity';
import { Subtopic } from '../database/entities/subtopic.entity';
import { Question } from '../database/entities/question.entity';
import { GameSession } from '../database/entities/game-session.entity';
import { ArcadeRecord } from '../database/entities/arcade-record.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Category, Subtopic, Question, GameSession, ArcadeRecord],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

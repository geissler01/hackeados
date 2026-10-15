import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from '../database/entities/category.entity';
import { Subtopic } from '../database/entities/subtopic.entity';
import { Question } from '../database/entities/question.entity';
import { GameSession } from '../database/entities/game-session.entity';
import { ArcadeRecord } from '../database/entities/arcade-record.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'hackeados_admin',
  password: process.env.DB_PASSWORD || 'hackeados_secret_2026',
  database: process.env.DB_NAME || 'hackeados_db',
  entities: [Category, Subtopic, Question, GameSession, ArcadeRecord],
  synchronize: false, // Las tablas se manejan vía script SQL/migraciones
  logging: process.env.NODE_ENV === 'development',
});

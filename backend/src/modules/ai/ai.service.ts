import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { Question } from '../../database/entities/question.entity';
import { Subtopic } from '../../database/entities/subtopic.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groqClient?: Groq;
  private geminiClient?: GoogleGenAI;

  constructor(
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(Subtopic) private readonly subtopicRepo: Repository<Subtopic>,
  ) {
    if (process.env.GROQ_API_KEY) this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    if (process.env.GEMINI_API_KEY) this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async ensurePoolProgressively(catId: string, target = 100, onProg?: (c: number) => void): Promise<void> {
    let current = await this.questionRepo.count({ where: { categoryId: catId } });
    if (onProg) onProg(current);
    let attempts = 0;
    while (current < target && attempts < 15) {
      attempts++;
      const ins = await this.generateBatch(catId, 10);
      current = await this.questionRepo.count({ where: { categoryId: catId } });
      if (onProg) onProg(current);
      if (ins === 0 && attempts > 4) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  async generateBatch(catId: string, count = 10): Promise<number> {
    const sub = await this.subtopicRepo.createQueryBuilder('s')
      .leftJoin('questions', 'q', 'q.subtopic_id = s.id').where('s.category_id = :catId', { catId })
      .groupBy('s.id').addGroupBy('s.name').addGroupBy('s.prompt_keywords')
      .orderBy('COUNT(q.id)', 'ASC').addOrderBy('RANDOM()').getOne();

    const topic = sub?.name || catId;
    const kw = sub?.promptKeywords ? ` Temas: ${sub.promptKeywords}.` : '';
    const prompt = `Genera ${count} preguntas de trivia en español sobre "${topic}".${kw}\nREGLAS: Todas las 4 opciones deben tener longitud y detalle similar (la correcta NUNCA debe ser la más larga ni más descriptiva). Opciones incorrectas realistas. Variar correctIndex (0 a 3).\nFormato JSON: {"questions": [{"questionText": "...", "options": ["o1","o2","o3","o4"], "correctIndex": 0}]}. Solo JSON.`;

    try {
      const raw = await this.callAiProvider(prompt);
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
      let inserted = 0;
      for (const item of list) {
        if (!item.questionText || !Array.isArray(item.options) || item.options.length !== 4) continue;
        if (typeof item.correctIndex !== 'number' || item.correctIndex < 0 || item.correctIndex > 3) continue;
        const exists = await this.questionRepo.findOne({ where: { questionText: item.questionText } });
        if (!exists) {
          const correctText = item.options[item.correctIndex];
          const shuffled = [...item.options].sort(() => Math.random() - 0.5);
          await this.questionRepo.save(this.questionRepo.create({
            categoryId: catId, subtopicId: sub?.id, questionText: item.questionText,
            options: shuffled, correctIndex: shuffled.indexOf(correctText),
          }));
          inserted++;
        }
      }
      this.logger.log(`IA generó ${inserted} preguntas para ${catId} (subtema: ${topic})`);
      return inserted;
    } catch (err: any) {
      this.logger.error(`Error generando preguntas: ${err.message}`);
      return 0;
    }
  }

  private async callAiProvider(prompt: string): Promise<string> {
    if (this.groqClient) {
      try {
        const res = await this.groqClient.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: (process.env.GROQ_MODEL as string) || 'qwen/qwen3.8-27b',
          response_format: { type: 'json_object' },
        });
        const text = res.choices[0]?.message?.content || '[]';
        return text.trim().startsWith('[') ? text : (JSON.parse(text).questions ? JSON.stringify(JSON.parse(text).questions) : text);
      } catch (err: any) {
        this.logger.warn(`Groq falló (${err.message}). Intentando IA de respaldo (Gemini)...`);
      }
    }
    if (this.geminiClient) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const res = await this.geminiClient.models.generateContent({
          model, contents: prompt + ' Responde únicamente con JSON válido.',
        });
        const clean = (res.text || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
        return clean;
      } catch (err: any) {
        this.logger.error(`Gemini de respaldo falló: ${err.message}`);
      }
    }
    throw new Error('Todos los proveedores de IA fallaron');
  }
}

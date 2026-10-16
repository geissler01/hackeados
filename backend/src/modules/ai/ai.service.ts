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
      if (ins === 0 && attempts > 3) break;
    }
  }

  async generateBatch(catId: string, count = 15): Promise<number> {
    const subtopic = await this.subtopicRepo.createQueryBuilder('s')
      .leftJoin('questions', 'q', 'q.subtopic_id = s.id')
      .where('s.category_id = :catId', { catId })
      .groupBy('s.id').addGroupBy('s.name').addGroupBy('s.prompt_keywords')
      .orderBy('COUNT(q.id)', 'ASC').addOrderBy('RANDOM()').getOne();

    const topic = subtopic?.name || catId;
    const kw = subtopic?.promptKeywords ? ` Temas: ${subtopic.promptKeywords}.` : '';
    const prompt = `Genera exactamente ${count} preguntas de trivia en español sobre "${topic}".${kw}
Formato JSON: {"questions": [{"questionText": "...", "options": ["op1","op2","op3","op4"], "correctIndex": 0}]}. Solo JSON.`;

    try {
      const raw = await this.callAiProvider(prompt);
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
      let inserted = 0;
      for (const item of list) {
        if (!item.questionText || !Array.isArray(item.options) || item.options.length !== 4) continue;
        const exists = await this.questionRepo.findOne({ where: { questionText: item.questionText } });
        if (!exists) {
          const q = this.questionRepo.create({
            categoryId: catId, subtopicId: subtopic?.id, questionText: item.questionText,
            options: item.options, correctIndex: item.correctIndex,
          });
          await this.questionRepo.save(q);
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
      const res = await this.groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.GROQ_MODEL as string,
        response_format: { type: 'json_object' },
      });
      const text = res.choices[0]?.message?.content || '[]';
      return text.trim().startsWith('[') ? text : (JSON.parse(text).questions ? JSON.stringify(JSON.parse(text).questions) : text);
    }
    if (this.geminiClient) {
      const res = await this.geminiClient.models.generateContent({
        model: process.env.GEMINI_MODEL as string, contents: prompt,
      });
      return res.text || '[]';
    }
    throw new Error('No hay API Keys de IA configuradas');
  }
}

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
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Subtopic)
    private readonly subtopicRepo: Repository<Subtopic>,
  ) {
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async generateBatch(categoryId: string, count: number = 15): Promise<number> {
    const subtopic = await this.subtopicRepo
      .createQueryBuilder('s')
      .where('s.category_id = :categoryId', { categoryId })
      .orderBy('RANDOM()')
      .getOne();

    const topicName = subtopic ? subtopic.name : categoryId;
    const prompt = `Genera exactamente ${count} preguntas de trivia en español sobre "${topicName}".
Formato JSON estricto: un arreglo de objetos con:
- "questionText": texto de la pregunta (conciso)
- "options": arreglo con exactamente 4 opciones de texto
- "correctIndex": número entero de 0 a 3 que indica la respuesta correcta.
Responde únicamente el bloque JSON, sin texto antes ni después.`;

    try {
      const rawJson = await this.callAiProvider(prompt);
      const parsed = JSON.parse(rawJson);
      let inserted = 0;

      for (const item of parsed) {
        if (!item.questionText || !Array.isArray(item.options) || item.options.length !== 4) continue;
        const exists = await this.questionRepo.findOne({ where: { questionText: item.questionText } });
        if (!exists) {
          const q = this.questionRepo.create({
            categoryId,
            subtopicId: subtopic?.id,
            questionText: item.questionText,
            options: item.options,
            correctIndex: item.correctIndex,
          });
          await this.questionRepo.save(q);
          inserted += 1;
        }
      }
      this.logger.log(`IA generó ${inserted} preguntas nuevas para ${categoryId}`);
      return inserted;
    } catch (err: any) {
      this.logger.error(`Error generando preguntas con IA: ${err.message}`);
      return 0;
    }
  }

  private async callAiProvider(prompt: string): Promise<string> {
    if (this.groqClient) {
      const res = await this.groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });
      const text = res.choices[0]?.message?.content || '[]';
      return text.trim().startsWith('[') ? text : (JSON.parse(text).questions ? JSON.stringify(JSON.parse(text).questions) : text);
    }
    if (this.geminiClient) {
      const res = await this.geminiClient.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: prompt,
      });
      return res.text || '[]';
    }
    throw new Error('No hay API Keys de IA configuradas');
  }
}

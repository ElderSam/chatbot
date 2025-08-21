import { Injectable } from '@nestjs/common';
import { create, all } from 'mathjs';
import { ConfigService } from '@nestjs/config';
import { GroqService } from '../groq/groq.service';

const math = create(all, {});

@Injectable()
export class MathAgentService {
  constructor(cfg: ConfigService, private groq: GroqService) {}

  private tryEval(expr: string): string | null {
    try { return String(math.evaluate(expr)); } catch { return null; }
  }

  private sanitizeExpr(expr: string) {
    // Treat x/X/× as * and only allow valid math chars
    expr = expr.replace(/[x×]/gi, '*');
    return expr.replace(/[^0-9\+\-\*\/\^\%\.\(\)]/g, '');
  }

  private extractDirect(message: string) {
    return this.sanitizeExpr(message);
  }

  // TODO. Não faz sentido isso. Deveria chamar o LLM direto para responder a pergunta matemática.
  private async nlToExpr(nl: string): Promise<string | null> {
    const prompt = `Convert the request into a valid mathjs expression.\nReturn ONLY the expression (no text). Example: "30% of 250" -> "0.30*250"\nUser: """${nl}"""`;
    try {
      let expr = await this.groq.chatCompletion({ prompt });

      expr = expr.trim().replace(/[x×]/g, '*').replace(/,/g, '.');

      if (!expr || !/^[0-9\.\s\+\-\*\/\^\%\(\)]*$/.test(expr)) return null;
      return expr;
    }
    catch {
      return null;
    }
  }

  async solve(message: string): Promise<string> {
    const directExpr = this.extractDirect(message);
    const directVal = this.tryEval(directExpr);
    if (directVal !== null && directVal !== '') return directVal;

    const expr = await this.nlToExpr(message);
    if (expr) {
      const v = this.tryEval(expr);
      if (v !== null) return v;
    }
    return 'Não consegui resolver. Tente algo como "30% de 250", "12 * 7", "raiz(16)".';
  }
}

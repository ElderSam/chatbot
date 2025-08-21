import { Injectable } from '@nestjs/common';

/* TODO
 ### 2.3. 🧮 MathAgent
 - Uses an LLM to interpret and answer simple mathematical expressions.
 - Examples:
   - `"How much is 65 x 3.11?"` // Não funciona ainda
   - `"70 + 12"` // OK, funciona
   - `"(42 * 2) / 6"` // Não funciona ainda
*/

@Injectable()
export class MathAgentService {
  async calculate(expression: string): Promise<string> {
    // Simple example, now with sanitization
    try {
        // Handle natural language math expressions with less repetition
        const lower = expression.toLowerCase().trim();
        // Only accept exact math expressions or well-defined natural language patterns
        const patterns = [
          { regex: /^calculate (\d+(?:\.\d+)?)(?:\s*([\+\-\*\/])\s*)(\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => eval(`${m[1]}${m[2]}${m[3]}`) },
          { regex: /^add (\d+(?:\.\d+)?) (?:and|with|to) (\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => Number(m[1]) + Number(m[2]) },
          { regex: /^subtract (\d+(?:\.\d+)?) from (\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => Number(m[2]) - Number(m[1]) },
          { regex: /^multiply (\d+(?:\.\d+)?) by (\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => Number(m[1]) * Number(m[2]) },
          { regex: /^divide (\d+(?:\.\d+)?) by (\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => Number(m[1]) / Number(m[2]) },
          { regex: /^how much is (\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/, fn: (m: RegExpMatchArray) => Number(m[1]) * Number(m[2]) },
        ];
        for (const { regex, fn } of patterns) {
          const match = lower.match(regex);
          if (match) return String(fn(match));
        }

        // Direct math expression (e.g., "(42 * 2) / 6", "70 + 12")
        const directMathRegex = /^[\d\s\+\-\*\/\.\(\)]+$/;
        if (directMathRegex.test(expression.trim())) {
          try {
            return String(eval(expression));
          } catch {
            return 'NaN';
          }
        }

        // If not matched, return NaN to indicate ambiguous or unsupported input
        return 'NaN';
    }
    catch (err) {
      console.error('MathAgent error:', err);
      return 'NaN';
    }
  }
}

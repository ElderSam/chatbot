import { Injectable } from '@nestjs/common';

// - Uses an LLM to interpret and answer simple mathematical expressions.
// - Examples:
//   - `"How much is 65 x 3.11?"`
//   - `"70 + 12"`
//   - `"(42 * 2) / 6"`

@Injectable()
export class MathAgentService {
  async calculate(expression: string): Promise<string> {
    // bem simples, só para exemplo
    try {
        return 'method for calculate is not implemented yet';
        // return eval(expression); // ⚠️ NÃO use eval em prod sem sanitizar
    }
    catch (err) {
        return 'NaN';
    }
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptGuardService {
  private suspiciousPatterns = [
    /ignore previous instructions/i,
    /disregard previous instructions/i,
    /act as/i,
    /pretend to be/i,
    /system:/i,
    /you are now/i,
    /execute code/i,
    /delete all/i,
    /shutdown/i,
    /reset/i
  ];
  private allowedLang = /[a-zA-ZáéíóúãõâêôçÁÉÍÓÚÃÕÂÊÔÇ]/;

  isBlocked(message: string): boolean {
    return this.suspiciousPatterns.some((pattern) => pattern.test(message)) || !this.allowedLang.test(message);
  }

  getBlockReason(message: string): string {
    if (!this.allowedLang.test(message)) {
      return 'Mensagem bloqueada: idioma não permitido.';
    }
    if (this.suspiciousPatterns.some((pattern) => pattern.test(message))) {
      return 'Mensagem bloqueada: instrução suspeita detectada.';
    }
    return '';
  }
}

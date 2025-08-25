import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptGuardService {

  private suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /disregard\s+previous\s+instructions/i,
    /act\s+as\s+(?:a\s+)?(?:admin|administrator|root|system)/i,
    /pretend\s+to\s+be/i,
    /you\s+are\s+now\s+(?:a\s+)?(?:admin|hacker|system)/i,
    /execute\s+(?:code|command|script)/i,
    /(?:delete|remove|drop)\s+(?:all|everything|database|table)/i,
    /(?:shutdown|restart|reboot)\s+(?:system|server)/i,
    /reset\s+(?:system|memory|instructions)/i
  ];

  private allowedLang = /[a-zA-ZáéíóúãõâêôçÁÉÍÓÚÃÕÂÊÔÇ]/;

  isBlocked(message: string): boolean {
    return this.suspiciousPatterns.some((pattern) => pattern.test(message)) || !this.allowedLang.test(message);
  }

  getBlockReason(message: string): string {
    if (!this.allowedLang.test(message)) {
      return 'Blocked message: language not allowed.';
    }
    if (this.suspiciousPatterns.some((pattern) => pattern.test(message))) {
      return 'Blocked message: suspicious instruction detected.';
    }
    return '';
  }
}

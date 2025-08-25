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
    /reset\s+(?:system|memory|instructions)/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i, // HTML <script> tags
  /function\s+\w+\s*\(|=>/i, // JS function or arrow function
  /console\.(log|error|warn|info|debug)\s*\(/i, // any console method
  /alert\s*\(/i, // alert usage
    /window\.|document\./i, // browser objects
    /eval\s*\(/i, // eval usage
    /setTimeout\s*\(|setInterval\s*\(/i, // JS timers
    /\$\{.*?\}/i // template string interpolation
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
      if (/<script[\s\S]*?>[\s\S]*?<\/script>/i.test(message) || /function\s+\w+\s*\(|=>/i.test(message) || /console\.log\s*\(/i.test(message) || /window\.|document\./i.test(message) || /eval\s*\(/i.test(message) || /setTimeout\s*\(|setInterval\s*\(/i.test(message) || /\$\{.*?\}/i.test(message)) {
        return 'Blocked message: JavaScript code detected.';
      }
      return 'Blocked message: suspicious instruction detected.';
    }
    return '';
  }
}

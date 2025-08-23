import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { prepareTextForSearch } from '../../common/utils/text-normalization.util';

function sanitizeInput(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// Store normalized messages temporarily during request processing
const normalizedMessageCache = new Map<string, string>();

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value.message === 'string') {
      // First sanitize HTML/JS content
      value.message = sanitizeInput(value.message);
      // Store normalized message in cache using conversation_id + user_id as key
      if (value.conversation_id && value.user_id) {
        const cacheKey = `${value.conversation_id}:${value.user_id}`;
        const normalizedMessage = prepareTextForSearch(value.message);
        normalizedMessageCache.set(cacheKey, normalizedMessage);
        // Clear cache after 5 minutes to prevent memory leaks
        setTimeout(() => normalizedMessageCache.delete(cacheKey), 5 * 60 * 1000);
      }
    }
    return value;
  }
}

export { normalizedMessageCache };

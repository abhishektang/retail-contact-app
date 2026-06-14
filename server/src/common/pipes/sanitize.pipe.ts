import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    if (typeof value !== 'object' || value === null) return value;

    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        sanitized[key] = sanitizeHtml(val, {
          allowedTags: [], // Strip ALL HTML tags
          allowedAttributes: {},
        }).trim();
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = this.sanitizeObject(val);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
}

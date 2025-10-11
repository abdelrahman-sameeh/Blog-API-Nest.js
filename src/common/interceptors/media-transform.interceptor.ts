import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';


@Injectable()
export class MediaTransformInterceptor implements NestInterceptor {
  private readonly mediaFields = ['picture', 'video', 'image', 'data'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 🧠 استخراج الـ base URL الديناميكي من request
    const protocol = request.protocol;
    const host = request.get('host');
    const base = `${protocol}://${host}`.replace(/\/$/, '');

    return next.handle().pipe(map((data) => this.transformMedia(data, new Set(), base)));
  }

  private transformMedia(obj: any, visited: Set<any>, base: string): any {
    if (!obj || typeof obj !== 'object') return obj;

    // 🛑 لو الكائن اتزار قبل كده، نرجع زي ما هو
    if (visited.has(obj)) return obj;
    visited.add(obj);

    const isAbsolute = (s: string) => /^https?:\/\//i.test(s);

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformMedia(item, visited, base));
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      // ✅ لو المفتاح من ضمن الـ mediaFields
      if (this.mediaFields.some((f) => key.toLowerCase().includes(f)) && typeof value === 'string' && !isAbsolute(value) && (value.startsWith("uploads/") || value.startsWith("/uploads/"))) {
        const path = value.startsWith('/') ? value : `/${value}`;
        obj[key] = `${base}${path}`;
      }

      // ✅ لو القيمة nested object أو array
      if (typeof value === 'object' && value !== null) {
        obj[key] = this.transformMedia(value, visited, base);
      }
    }

    return obj;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';



@Injectable()
export class MediaTransformInterceptor implements NestInterceptor {
  private readonly mediaFields = ['picture', 'thumbnail', 'video', 'image', 'mediaUrl', 'file', 'avatar', 'data'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformMedia(data, new Set())));
  }

  private transformMedia(obj: any, visited: Set<any>): any {
    if (!obj || typeof obj !== 'object') return obj;

    // 🛑 لو الكائن اتزار قبل كده، نرجع زي ما هو
    if (visited.has(obj)) return obj;
    visited.add(obj);

    const isAbsolute = (s: string) => /^https?:\/\//i.test(s);
    const base =
      (process.env.SERVER_URL ||
        process.env.APP_URL ||
        `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformMedia(item, visited));
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      // ✅ لو المفتاح من ضمن الـ mediaFields
      if (this.mediaFields.some((f) => key.toLowerCase().includes(f)) && typeof value === 'string' && !isAbsolute(value)) {
        const path = value.startsWith('/') ? value : `/${value}`;
        obj[key] = `${base}${path}`;
      }

      // ✅ لو القيمة nested object أو array
      if (typeof value === 'object' && value !== null) {
        obj[key] = this.transformMedia(value, visited);
      }
    }

    return obj;
  }
}

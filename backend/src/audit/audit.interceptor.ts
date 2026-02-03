import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService, AuditAction } from './audit.service';
import { Department } from '@prisma/client';
import { Request } from 'express';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_ENTITY_TYPE_KEY = 'audit_entity_type';

export interface AuditMetadata {
  action: AuditAction;
  entityType: string;
  getEntityId?: (result: unknown, request: Request) => string;
  getDetails?: (result: unknown, request: Request) => Record<string, unknown>;
}

export function Audit(metadata: AuditMetadata): MethodDecorator {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_ACTION_KEY, metadata, descriptor.value as object);
    return descriptor;
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    department: Department;
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadata>(AUDIT_ACTION_KEY, context.getHandler());

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((result) => {
        const entityId = metadata.getEntityId
          ? metadata.getEntityId(result, request)
          : this.extractEntityId(result, request);

        const details = metadata.getDetails ? metadata.getDetails(result, request) : undefined;

        if (entityId) {
          // Fire and forget - don't block the response
          this.auditService
            .log(metadata.action, metadata.entityType, entityId, user.id, user.department, details)
            .catch((error) => {
              // Don't fail the request if audit logging fails
              console.error('Audit logging failed:', error);
            });
        }
      }),
    );
  }

  private extractEntityId(result: unknown, request: Request): string | null {
    // Try to get ID from result
    if (result && typeof result === 'object' && 'id' in result) {
      return (result as { id: string }).id;
    }

    // Try to get ID from request params
    if (request.params?.id) {
      const id = request.params.id;
      return typeof id === 'string' ? id : null;
    }

    return null;
  }
}

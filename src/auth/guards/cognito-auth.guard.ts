import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { getCurrentInvoke } from '@codegenie/serverless-express'
import type { Request } from 'express'
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js'

interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedUser
}

function parseGroups(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((group): group is string => typeof group === 'string')
  }
  if (typeof value === 'string') {
    return value.split(',').map((group) => group.trim()).filter(Boolean)
  }
  return []
}

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const invoke = getCurrentInvoke()
    const event = invoke?.event as {
      requestContext?: {
        authorizer?: {
          claims?: Record<string, unknown>
          jwt?: { claims?: Record<string, unknown> }
        }
      }
    } | undefined
    const authorizer = event?.requestContext?.authorizer
    const claims = authorizer?.claims ?? authorizer?.jwt?.claims
    const userId = claims?.sub

    if (typeof userId !== 'string' || !userId) {
      throw new UnauthorizedException('Token de acceso ausente o inválido.')
    }

    request.authenticatedUser = {
      userId,
      groups: parseGroups(claims['cognito:groups']),
    }
    return true
  }
}

import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js'

interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedUser
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.authenticatedUser) {
      throw new Error('CognitoAuthGuard no asignó el usuario autenticado.')
    }
    return request.authenticatedUser
  },
)

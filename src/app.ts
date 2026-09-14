import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { z } from 'zod'
import { authenticatedUser } from './http/auth'
import { jsonResponse } from './http/response'
import type { UserProfileRepository } from './repositories/user-profile-repository'
import { UserProfileService } from './services/user-profile-service'

const saveProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  address: z.string().trim().max(300).nullable().optional(),
}).strict()

function requestPath(event: APIGatewayProxyEvent) {
  return event.resource || event.path
}

function parseBody(event: APIGatewayProxyEvent) {
  if (!event.body) return undefined
  return JSON.parse(event.body) as unknown
}

export function createApp(repository: UserProfileRepository) {
  const service = new UserProfileService(repository)

  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const user = authenticatedUser(event)
      if (!user) {
        return jsonResponse(401, { message: 'Token de acceso ausente o inválido.' })
      }

      if (requestPath(event) !== '/users/me') {
        return jsonResponse(404, { message: 'Ruta no encontrada.' })
      }

      if (event.httpMethod === 'GET') {
        const profile = await service.getProfile(user.userId)
        return profile
          ? jsonResponse(200, { data: profile })
          : jsonResponse(404, { message: 'El perfil todavía no existe.' })
      }

      if (event.httpMethod === 'PUT') {
        const input = saveProfileSchema.parse(parseBody(event))
        const profile = await service.saveProfile({
          userId: user.userId,
          displayName: input.displayName,
          address: input.address ?? null,
        })
        return jsonResponse(200, { data: profile })
      }

      return {
        ...jsonResponse(405, { message: 'Método no permitido.' }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          Allow: 'GET, PUT',
        },
      }
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        return jsonResponse(400, {
          message: 'El cuerpo de la solicitud no es válido.',
          ...(error instanceof z.ZodError ? { issues: error.issues } : {}),
        })
      }

      console.error('Unhandled users-service error', error)
      return jsonResponse(500, { message: 'Ocurrió un error interno.' })
    }
  }
}


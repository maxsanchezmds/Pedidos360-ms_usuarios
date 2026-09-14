import type { APIGatewayProxyEvent } from 'aws-lambda'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import type { SaveUserProfileInput, UserProfile } from '../src/domain/user-profile'
import type { UserProfileRepository } from '../src/repositories/user-profile-repository'

class InMemoryUserProfileRepository implements UserProfileRepository {
  private readonly profiles = new Map<string, UserProfile>()

  findById(userId: string) {
    return Promise.resolve(this.profiles.get(userId) ?? null)
  }

  save(input: SaveUserProfileInput) {
    const existing = this.profiles.get(input.userId)
    const now = '2026-09-14T00:00:00.000Z'
    const profile: UserProfile = {
      ...input,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    this.profiles.set(profile.userId, profile)
    return Promise.resolve(profile)
  }
}

function event(
  httpMethod: string,
  body?: unknown,
  sub: string | null = 'cognito-user-sub',
): APIGatewayProxyEvent {
  return {
    resource: '/users/me',
    path: '/users/me',
    httpMethod,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: 'test',
      apiId: 'test',
      authorizer: sub ? { claims: { sub, 'cognito:groups': 'Customer' } } : undefined,
      protocol: 'HTTP/1.1',
      httpMethod,
      identity: {} as APIGatewayProxyEvent['requestContext']['identity'],
      path: '/users/me',
      stage: 'test',
      requestId: 'test',
      requestTimeEpoch: 0,
      resourceId: 'test',
      resourcePath: '/users/me',
    },
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false,
  }
}

describe('users service', () => {
  it('rechaza solicitudes sin identidad de Cognito', async () => {
    const app = createApp(new InMemoryUserProfileRepository())
    const response = await app(event('GET', undefined, null))

    expect(response.statusCode).toBe(401)
  })

  it('crea y obtiene el perfil del usuario autenticado', async () => {
    const app = createApp(new InMemoryUserProfileRepository())
    const saved = await app(event('PUT', {
      displayName: 'Ana Pérez',
      address: 'Santiago',
    }))
    const found = await app(event('GET'))

    expect(saved.statusCode).toBe(200)
    expect(found.statusCode).toBe(200)
    expect(JSON.parse(found.body).data).toMatchObject({
      userId: 'cognito-user-sub',
      displayName: 'Ana Pérez',
      address: 'Santiago',
    })
  })

  it('rechaza campos desconocidos y nombres inválidos', async () => {
    const app = createApp(new InMemoryUserProfileRepository())
    const response = await app(event('PUT', {
      displayName: 'A',
      role: 'Admin',
    }))

    expect(response.statusCode).toBe(400)
  })
})

import { describe, expect, it } from 'vitest'
import type {
  SaveUserProfileInput,
  UserProfile,
} from '../src/users/interfaces/user-profile.interface.js'
import type { UserProfileRepository } from '../src/users/interfaces/user-profile-repository.interface.js'
import { UsersService } from '../src/users/services/users.service.js'

class InMemoryRepository implements UserProfileRepository {
  private readonly profiles = new Map<string, UserProfile>()

  findById(userId: string) {
    return Promise.resolve(this.profiles.get(userId) ?? null)
  }

  save(input: SaveUserProfileInput) {
    const existing = this.profiles.get(input.userId)
    const now = '2026-09-14T00:00:00.000Z'
    const profile = {
      ...input,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    this.profiles.set(input.userId, profile)
    return Promise.resolve(profile)
  }
}

describe('UsersService', () => {
  function createService() {
    return new UsersService(new InMemoryRepository())
  }

  it('crea y recupera un perfil por el sub de Cognito', async () => {
    const service = createService()
    await service.updateMyProfile('cognito-sub', {
      displayName: ' Ana Pérez ',
      address: ' Santiago ',
    })

    await expect(service.findMyProfile('cognito-sub')).resolves.toMatchObject({
      userId: 'cognito-sub',
      displayName: 'Ana Pérez',
      address: 'Santiago',
    })
  })

  it('devuelve null si el perfil todavía no existe', async () => {
    const service = createService()
    await expect(service.findMyProfile('missing')).resolves.toBeNull()
  })
})

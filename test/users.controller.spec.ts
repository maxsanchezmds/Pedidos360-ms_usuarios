import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, expect, it, vi } from 'vitest'
import type { AuthenticatedUser } from '../src/auth/interfaces/authenticated-user.interface.js'
import { UsersController } from '../src/users/controllers/users.controller.js'
import type { UserProfile } from '../src/users/interfaces/user-profile.interface.js'
import { UsersService } from '../src/users/services/users.service.js'

describe('UsersController', () => {
  const user: AuthenticatedUser = { userId: 'cognito-sub', groups: ['Customer'] }
  const profile: UserProfile = {
    userId: user.userId,
    displayName: 'Ana Pérez',
    address: 'Santiago',
    createdAt: '2026-09-14T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z',
  }

  it('devuelve el perfil actual', async () => {
    const usersService = {
      findMyProfile: vi.fn().mockResolvedValue(profile),
      updateMyProfile: vi.fn(),
    }
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile()

    await expect(module.get(UsersController).findMe(user)).resolves.toEqual({ data: profile })
  })

  it('responde NotFoundException cuando no existe', async () => {
    const usersService = {
      findMyProfile: vi.fn().mockResolvedValue(null),
      updateMyProfile: vi.fn(),
    }
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile()

    await expect(module.get(UsersController).findMe(user)).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})

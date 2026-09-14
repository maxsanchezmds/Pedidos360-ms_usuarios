import { Test } from '@nestjs/testing'
import { describe, expect, it, vi } from 'vitest'
import { StatusController } from '../src/status/controllers/status.controller.js'
import type { ServiceStatus } from '../src/status/interfaces/service-status.interface.js'
import { StatusService } from '../src/status/services/status.service.js'

describe('StatusController', () => {
  it('devuelve el estado entregado por el servicio', async () => {
    const status: ServiceStatus = {
      status: 'ok',
      service: 'users',
      timestamp: '2026-09-14T12:00:00.000Z',
    }
    const statusService = { getStatus: vi.fn().mockReturnValue(status) }
    const module = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [{ provide: StatusService, useValue: statusService }],
    }).compile()

    expect(module.get(StatusController).getStatus()).toEqual(status)
  })
})

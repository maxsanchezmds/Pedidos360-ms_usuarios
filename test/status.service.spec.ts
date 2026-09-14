import { afterEach, describe, expect, it, vi } from 'vitest'
import { StatusService } from '../src/status/services/status.service.js'

describe('StatusService', () => {
  afterEach(() => vi.useRealTimers())

  it('informa que el microservicio está disponible', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-14T12:00:00.000Z'))

    expect(new StatusService().getStatus()).toEqual({
      status: 'ok',
      service: 'users',
      timestamp: '2026-09-14T12:00:00.000Z',
    })
  })
})

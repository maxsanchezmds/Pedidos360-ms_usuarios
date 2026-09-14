import { Injectable } from '@nestjs/common'
import type { ServiceStatus } from '../interfaces/service-status.interface.js'

@Injectable()
export class StatusService {
  getStatus(): ServiceStatus {
    return {
      status: 'ok',
      service: 'users',
      timestamp: new Date().toISOString(),
    }
  }
}

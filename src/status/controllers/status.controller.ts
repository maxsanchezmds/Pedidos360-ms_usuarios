import { Controller, Get, Inject } from '@nestjs/common'
import { StatusService } from '../services/status.service.js'

@Controller('status')
export class StatusController {
  constructor(@Inject(StatusService) private readonly statusService: StatusService) {}

  @Get()
  getStatus() {
    return this.statusService.getStatus()
  }
}

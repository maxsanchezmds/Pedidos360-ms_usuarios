import { Module } from '@nestjs/common'
import { StatusController } from './controllers/status.controller.js'
import { StatusService } from './services/status.service.js'

@Module({
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}

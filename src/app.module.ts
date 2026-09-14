import { Module } from '@nestjs/common'
import { StatusModule } from './status/status.module.js'
import { UsersModule } from './users/users.module.js'

@Module({
  imports: [StatusModule, UsersModule],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { USER_PROFILE_REPOSITORY } from '../common/constants/injection-tokens.js'
import { DatabaseModule } from '../database/database.module.js'
import { CognitoAuthGuard } from '../auth/guards/cognito-auth.guard.js'
import { UsersController } from './controllers/users.controller.js'
import { PostgresUserProfileRepository } from './repositories/postgres-user-profile.repository.js'
import { UsersService } from './services/users.service.js'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    CognitoAuthGuard,
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: PostgresUserProfileRepository,
    },
  ],
})
export class UsersModule {}

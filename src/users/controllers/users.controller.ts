import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js'
import { CognitoAuthGuard } from '../../auth/guards/cognito-auth.guard.js'
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js'
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto.js'
import { UsersService } from '../services/users.service.js'

@Controller('users')
@UseGuards(CognitoAuthGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  async findMe(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.usersService.findMyProfile(user.userId)
    if (!profile) throw new NotFoundException('El perfil todavía no existe.')
    return { data: profile }
  }

  @Put('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const profile = await this.usersService.updateMyProfile(user.userId, dto)
    return { data: profile }
  }
}

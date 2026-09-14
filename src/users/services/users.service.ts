import { Inject, Injectable } from '@nestjs/common'
import { USER_PROFILE_REPOSITORY } from '../../common/constants/injection-tokens.js'
import type { UpdateUserProfileDto } from '../dto/update-user-profile.dto.js'
import type { UserProfileRepository } from '../interfaces/user-profile-repository.interface.js'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly repository: UserProfileRepository,
  ) {}

  findMyProfile(userId: string) {
    return this.repository.findById(userId)
  }

  updateMyProfile(userId: string, dto: UpdateUserProfileDto) {
    return this.repository.save({
      userId,
      displayName: dto.displayName.trim(),
      address: dto.address?.trim() || null,
    })
  }
}

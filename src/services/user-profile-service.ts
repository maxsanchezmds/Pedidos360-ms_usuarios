import type { SaveUserProfileInput } from '../domain/user-profile'
import type { UserProfileRepository } from '../repositories/user-profile-repository'

export class UserProfileService {
  constructor(private readonly repository: UserProfileRepository) {}

  getProfile(userId: string) {
    return this.repository.findById(userId)
  }

  saveProfile(input: SaveUserProfileInput) {
    return this.repository.save(input)
  }
}


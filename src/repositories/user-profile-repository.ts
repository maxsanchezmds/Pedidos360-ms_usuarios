import type { SaveUserProfileInput, UserProfile } from '../domain/user-profile'

export interface UserProfileRepository {
  findById(userId: string): Promise<UserProfile | null>
  save(input: SaveUserProfileInput): Promise<UserProfile>
}


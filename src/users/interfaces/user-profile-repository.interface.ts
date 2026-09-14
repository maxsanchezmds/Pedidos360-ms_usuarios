import type { SaveUserProfileInput, UserProfile } from './user-profile.interface.js'

export interface UserProfileRepository {
  findById(userId: string): Promise<UserProfile | null>
  save(input: SaveUserProfileInput): Promise<UserProfile>
}

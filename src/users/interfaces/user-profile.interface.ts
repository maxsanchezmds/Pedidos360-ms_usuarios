export interface UserProfile {
  userId: string
  displayName: string
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveUserProfileInput {
  userId: string
  displayName: string
  address: string | null
}


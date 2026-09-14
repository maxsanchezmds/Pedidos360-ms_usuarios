import type { Pool } from 'pg'
import type { SaveUserProfileInput, UserProfile } from '../domain/user-profile'
import type { UserProfileRepository } from './user-profile-repository'

interface UserProfileRow {
  user_id: string
  display_name: string
  address: string | null
  created_at: Date
  updated_at: Date
}

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    address: row.address,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export class PostgresUserProfileRepository implements UserProfileRepository {
  constructor(private readonly pool: Pool) {}

  async findById(userId: string) {
    const result = await this.pool.query<UserProfileRow>(
      `SELECT user_id, display_name, address, created_at, updated_at
       FROM user_profiles
       WHERE user_id = $1`,
      [userId],
    )

    return result.rows[0] ? toUserProfile(result.rows[0]) : null
  }

  async save(input: SaveUserProfileInput) {
    const result = await this.pool.query<UserProfileRow>(
      `INSERT INTO user_profiles (user_id, display_name, address)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           address = EXCLUDED.address,
           updated_at = NOW()
       RETURNING user_id, display_name, address, created_at, updated_at`,
      [input.userId, input.displayName, input.address],
    )

    const profile = result.rows[0]
    if (!profile) throw new Error('PostgreSQL no devolvió el perfil guardado.')
    return toUserProfile(profile)
  }
}


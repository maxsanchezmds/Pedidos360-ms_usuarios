import { IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class UpdateUserProfileDto {
  @IsString()
  @Length(2, 100)
  displayName!: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string | null
}


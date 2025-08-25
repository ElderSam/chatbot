import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'User name cannot be empty' })
  @MinLength(2, { message: 'User name must have at least 2 characters' })
  @MaxLength(50, { message: 'User name cannot exceed 50 characters' })
  user_name: string;
}

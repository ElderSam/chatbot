import { IsString, Matches, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChatDto {
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MinLength(5, { message: 'Message must have at least 5 characters' })
  message: string;

  @IsString()
  @Matches(/^client\d+$/)
  user_id: string;

  @IsString()
  @Matches(/^conv-\d+$/)
  conversation_id: string;
}

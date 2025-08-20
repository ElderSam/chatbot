import { IsString, Matches } from 'class-validator';

export class ChatDto {
  @IsString()
  message: string;

  @IsString()
  @Matches(/^client\d+$/)
  user_id: string;

  @IsString()
  @Matches(/^conv-\d+$/)
  conversation_id: string;
}

import { IsString, Matches } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @Matches(/^client\d+$/, { message: 'user_id must be in format: client{number}' })
  user_id: string;
}

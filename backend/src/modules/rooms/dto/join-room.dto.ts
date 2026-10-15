import { IsString, IsNotEmpty, Length, IsInt, Min, Max } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  roomCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  nickname: string;

  @IsInt()
  @Min(1)
  @Max(20)
  avatarId: number = 1;
}

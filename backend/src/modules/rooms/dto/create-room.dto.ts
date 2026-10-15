import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsIn, IsBoolean, Length } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(600)
  durationSeconds?: number = 300;

  @IsOptional()
  @IsIn(['matrix-emerald', 'cyber-arcade', 'amber-crt'])
  theme?: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt' = 'matrix-emerald';

  @IsOptional()
  @IsBoolean()
  isHostPlaying?: boolean = false;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  hostNickname?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  hostAvatarId?: number = 1;
}

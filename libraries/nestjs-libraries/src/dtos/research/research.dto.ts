import { IsString, MinLength } from 'class-validator';

export class ResearchDto {
  @IsString()
  @MinLength(10)
  query: string;
} 
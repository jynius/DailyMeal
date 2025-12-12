import { IsString, IsNotEmpty } from 'class-validator'

export class FindUserDto {
  @IsString()
  @IsNotEmpty()
  name: string
}

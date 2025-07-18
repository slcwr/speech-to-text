import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../../database/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}
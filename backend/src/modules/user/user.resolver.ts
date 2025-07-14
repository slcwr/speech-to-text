import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import { UserService } from './user.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }
}
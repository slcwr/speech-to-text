import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from '../fragments/user';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;
import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from '../fragments/user';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      token
      user {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;
import { gql } from '@apollo/client';
import { USER_FRAGMENT, USER_BASIC_FRAGMENT } from '../fragments/user';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($input: UpdatePasswordInput!) {
    updateUserPassword(input: $input) {
      success
      message
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;
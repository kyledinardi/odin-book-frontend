import { gql } from '@apollo/client';

export const LOCAL_LOGIN = gql`
  mutation localLogin($email: String!, $password: String!) {
    localLogin(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser(
    $displayName: String
    $username: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    createUser(
      displayName: $displayName
      username: $username
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      token
      user {
        id
      }
    }
  }
`;

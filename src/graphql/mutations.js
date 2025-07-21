import { gql } from '@apollo/client';

export const LOCAL_LOGIN = gql`
  mutation localLogin($email: String!, $password: String!) {
    localLogin(email: $email, password: $password) {
      token
    }
  }
`;

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;

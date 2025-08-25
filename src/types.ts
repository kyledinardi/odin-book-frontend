export interface LoginResponse {
  __typename: 'LoginResponse';
  token: string;
  user: { __typename: 'User'; id: string };
}

export interface LocalLogin {
  localLogin: LoginResponse;
}

export interface CreateUser {
  createUser: LoginResponse;
}

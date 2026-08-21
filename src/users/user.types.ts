export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UserPublic {
  id: UserId;
  name: string;
  email: string;
  username: string;
}

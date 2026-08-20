import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserId,
} from "./user.types";

export class UserNotFoundError extends Error {
  constructor(id: UserId) {
    super(`User not found: ${id}`);
    this.name = "UserNotFoundError";
  }
}

@Injectable()
export class UsersRepository {
  private readonly users = new Map<UserId, User>();

  create(input: CreateUserInput, id: UserId = randomUUID()): User {
    const user: User = { id, ...input };
    this.users.set(user.id, user);
    return user;
  }

  getById(id: UserId): User {
    const user = this.users.get(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }

  update(id: UserId, input: UpdateUserInput): User {
    const existing = this.getById(id);
    const updated: User = {
      ...existing,
      ...input,
    };
    this.users.set(id, updated);
    return updated;
  }

  delete(id: UserId): void {
    const existed = this.users.delete(id);
    if (!existed) throw new UserNotFoundError(id);
  }
}

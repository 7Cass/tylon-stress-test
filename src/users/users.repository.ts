import { Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "crypto";

import { CreateUserInput, UpdateUserInput, User, UserId } from "./user.types";

export class UserNotFoundError extends Error {
  constructor(id: UserId) {
    super(`User not found: ${id}`);
    this.name = "UserNotFoundError";
  }
}

export class UserConflictError extends Error {
  constructor(username: string) {
    super(`User already exists: ${username}`);
    this.name = "UserConflictError";
  }
}

@Injectable()
export class UsersRepository {
  private readonly users = new Map<UserId, User>();
  private queue: Promise<void> = Promise.resolve();

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  verifyPassword(user: User, password: string): boolean {
    return user.password === this.hashPassword(password);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.runExclusive(() =>
      Array.from(this.users.values()).find((user) => user.username === username),
    );
  }

  private runExclusive<T>(fn: () => T): Promise<T> {
    const next = this.queue.then(() => fn());
    this.queue = next.then(() => undefined, () => undefined);
    return next;
  }

  async create(input: CreateUserInput, id: UserId = randomUUID()): Promise<User> {
    return this.runExclusive(() => {
      if (Array.from(this.users.values()).some((user) => user.username === input.username)) {
        throw new UserConflictError(input.username);
      }

      const user: User = {
        id,
        name: input.name,
        email: input.email,
        username: input.username,
        password: this.hashPassword(input.password),
      };
      this.users.set(user.id, user);
      return user;
    });
  }

  async getById(id: UserId): Promise<User> {
    return this.runExclusive(() => {
      const user = this.users.get(id);
      if (!user) throw new UserNotFoundError(id);
      return user;
    });
  }

  async list(): Promise<User[]> {
    return this.runExclusive(() => Array.from(this.users.values()));
  }

  async update(id: UserId, input: UpdateUserInput): Promise<User> {
    return this.runExclusive(() => {
      const existing = this.users.get(id);
      if (!existing) throw new UserNotFoundError(id);

      const updated: User = { ...existing, ...input };
      this.users.set(id, updated);
      return updated;
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.runExclusive(() => {
      const existed = this.users.delete(id);
      if (!existed) throw new UserNotFoundError(id);
    });
  }
}

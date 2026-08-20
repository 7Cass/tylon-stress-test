import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

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

  // Very small “stress test” lock: in JS, operations interleave via the event loop,
  // so we serialize CRUD for correctness under concurrent requests.
  private queue: Promise<void> = Promise.resolve();

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  private runExclusive<T>(fn: () => T): Promise<T> {
    // Serialize by chaining onto the tail promise.
    const next = this.queue.then(() => fn());
    // Keep the tail alive even if this operation throws.
    this.queue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  async create(input: CreateUserInput, id: UserId = randomUUID()): Promise<User> {
    return this.runExclusive(() => {
      const user: User = {
        id,
        name: input.name,
        email: input.email,
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

      const updated: User = {
        ...existing,
        ...input,
      };
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

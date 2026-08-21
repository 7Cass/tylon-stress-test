import { Body, ConflictException, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { CreateUserInput, UpdateUserInput, UserPublic } from "./user.types";
import { UserConflictError, UserNotFoundError, UsersRepository } from "./users.repository";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

function toPublic(u: { id: string; name: string; email: string; username: string }): UserPublic {
  return { id: u.id, name: u.name, email: u.email, username: u.username };
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersRepository) {}

  @Post()
  async create(@Body() body: CreateUserInput) {
    try {
      const created = await this.users.create(body);
      return toPublic(created);
    } catch (err) {
      if (err instanceof UserConflictError) {
        throw new ConflictException({ message: err.message });
      }
      throw err;
    }
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    try {
      return toPublic(await this.users.getById(id));
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({ error: "UserNotFound", message: "User not found" });
      }
      throw err;
    }
  }

  @Get()
  async list() {
    return (await this.users.list()).map((u) => toPublic(u));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: Partial<Pick<UpdateUserInput, "name" | "email">>) {
    try {
      return toPublic(await this.users.update(id, body as UpdateUserInput));
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({ error: "UserNotFound", message: "User not found" });
      }
      throw err;
    }
  }

  @Delete(":id")
  @HttpCode(204)
  async delete(@Param("id") id: string) {
    try {
      await this.users.delete(id);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({ error: "UserNotFound", message: "User not found" });
      }
      throw err;
    }
  }
}

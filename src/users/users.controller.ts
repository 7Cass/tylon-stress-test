import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import {
  CreateUserInput,
  UpdateUserInput,
  UserPublic,
} from "./user.types";
import { UsersRepository, UserNotFoundError } from "./users.repository";

function toPublic(u: { id: string; name: string; email: string }): UserPublic {
  return { id: u.id, name: u.name, email: u.email };
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersRepository) {}

  @Post()
  async create(@Body() body: CreateUserInput) {
    const created = await this.users.create(body);
    return { id: created.id, name: created.name, email: created.email };
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    try {
      const user = await this.users.getById(id);
      return { id: user.id, name: user.name, email: user.email };
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({
          error: "UserNotFound",
          message: "User not found",
        });
      }
      throw err;
    }
  }

  @Get()
  async list() {
    const users = await this.users.list();
    return users.map((u) => toPublic(u));
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: Partial<Pick<UpdateUserInput, "name" | "email">>,
  ) {
    try {
      const updated = await this.users.update(id, body as UpdateUserInput);
      return { id: updated.id, name: updated.name, email: updated.email };
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({
          error: "UserNotFound",
          message: "User not found",
        });
      }
      throw err;
    }
  }

  @Delete(":id")
  @HttpCode(204)
  async delete(@Param("id") id: string) {
    try {
      await this.users.delete(id);
      return;
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException({
          error: "UserNotFound",
          message: "User not found",
        });
      }
      throw err;
    }
  }
}

import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";

import { Public } from "../common/http/public.decorator";
import { CreateUserInput, UpdateUserInput, UserPublic } from "./user.types";
import { UserNotFoundError, UsernameAlreadyExistsError, UsersRepository } from "./users.repository";

class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

function toPublic(u: { id: string; name: string; email: string; username: string }): UserPublic {
  return { id: u.id, name: u.name, email: u.email, username: u.username };
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersRepository) {}

  @Public()
  @Post()
  async create(@Body() body: CreateUserDto) {
    try {
      return toPublic(await this.users.create(body as CreateUserInput));
    } catch (err) {
      if (err instanceof UsernameAlreadyExistsError) {
        throw new ConflictException({ message: "Username already exists" });
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

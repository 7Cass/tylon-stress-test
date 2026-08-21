import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";

import { Public } from "../common/http/public.decorator";
import { AuthService } from "./auth.service";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }
}

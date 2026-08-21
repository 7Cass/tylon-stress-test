import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "crypto";

import { UsersRepository } from "../users/users.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.users.findByUsername(username.trim());
    if (!user || user.password !== this.hash(password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      accessToken: await this.jwtService.signAsync(
        { username: user.username },
        { subject: user.id },
      ),
    };
  }

  private hash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}

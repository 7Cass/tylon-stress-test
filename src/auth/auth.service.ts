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

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.users.findByEmail(email.trim());
    if (!user || user.password !== this.hashPassword(password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      access_token: await this.jwtService.signAsync(
        { sub: user.id, username: user.username },
      ),
    };
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}

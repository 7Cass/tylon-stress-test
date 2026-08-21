import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UsersRepository } from "../users/users.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.users.findByUsername(username);
    if (!user || !this.users.verifyPassword(user, password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: "30m" },
    );

    return { accessToken };
  }
}

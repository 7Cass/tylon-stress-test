import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersController } from "./users/users.controller";
import { UsersRepository } from "./users/users.repository";

@Module({
  imports: [AuthModule],
  controllers: [AppController, UsersController],
  providers: [UsersRepository],
})
export class AppModule {}

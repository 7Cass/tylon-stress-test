import { Body, Controller, Get, Post } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok" };
  }

  @Post("json-body")
  jsonBody(@Body() body: Record<string, unknown>) {
    return { body };
  }
}

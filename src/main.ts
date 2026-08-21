import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/http/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Nest handler to standardize unexpected errors.
  // Note: typings only; runtime error payload is standardized by the filter.
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

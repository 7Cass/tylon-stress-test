import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "../src/app.module";

describe("AppController (health)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns 200", async () => {
    await request(app.getHttpServer()).get("/health").expect(200);
  });

  it("POST /json-body returns the json body", async () => {
    await request(app.getHttpServer())
      .post("/json-body")
      .send({ name: "Ada" })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ body: { name: "Ada" } });
      });
  });
});

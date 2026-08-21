import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { decode } from "jsonwebtoken";

import { AppModule } from "../src/app.module";

describe("auth e2e", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("covers auth and protected users routes", async () => {
    const created = await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
        password: "secret",
      })
      .expect(201);

    expect(created.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.body.username).toBe("testuser");
    expect(created.body.password).toBeUndefined();

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "testuser", password: "secret" })
      .expect(200);

    expect(login.body.accessToken).toBeDefined();
    const decoded: any = decode(login.body.accessToken);
    expect(decoded.sub).toBe(created.body.id);
    expect(decoded.exp - decoded.iat).toBe(1800);

    await request(app.getHttpServer()).get("/users").expect(401);
    await request(app.getHttpServer()).get(`/users/${created.body.id}`).expect(401);
    await request(app.getHttpServer()).patch(`/users/${created.body.id}`).send({ name: "x" }).expect(401);
    await request(app.getHttpServer()).delete(`/users/${created.body.id}`).expect(401);

    await request(app.getHttpServer()).get("/health").expect(200);

    await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "testuser", password: "wrong" })
      .expect(401)
      .expect(({ body }) => {
        expect(body.code).toBe("UNAUTHORIZED");
        expect(body.message).toBe("Invalid credentials");
      });

    await request(app.getHttpServer()).get("/users").set("Authorization", "Bearer not-a-jwt").expect(401);
  });
});

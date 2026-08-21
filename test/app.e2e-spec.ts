import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { createHmac, randomBytes } from "crypto";
import * as request from "supertest";

import { AppModule } from "../src/app.module";

function decodeBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="), "base64");
}

function signJwt(payload: Record<string, unknown>, secret: string, expiresInSeconds: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe("App e2e", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = "tylon-stress-test-dev-secret";
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("covers auth and protected users routes", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .send({ name: "João", email: "joao@example.com", username: "joao", password: "pw" })
      .expect(201);

    expect(createRes.body).toMatchObject({ name: "João", email: "joao@example.com", username: "joao" });
    expect(createRes.body.password).toBeUndefined();
    expect(createRes.body.id).toMatch(/^[0-9a-f-]{36}$/i);

    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "joao", password: "pw" })
      .expect(200);

    expect(Object.keys(loginRes.body)).toEqual(["accessToken"]);
    const token = loginRes.body.accessToken;
    const [, payloadPart] = token.split(".");
    const payload = JSON.parse(decodeBase64Url(payloadPart).toString("utf8"));
    expect(payload.sub).toBe(createRes.body.id);
    expect(payload.exp - payload.iat).toBe(1800);

    await request(app.getHttpServer()).get("/users").expect(401, { status: 401, code: "UNAUTHORIZED", message: "Unauthorized" });
    await request(app.getHttpServer()).get(`/users/${createRes.body.id}`).expect(401);
    await request(app.getHttpServer()).patch(`/users/${createRes.body.id}`).send({ name: "x" }).expect(401);
    await request(app.getHttpServer()).delete(`/users/${createRes.body.id}`).expect(401);

    await request(app.getHttpServer()).get("/health").expect(200, { status: "ok" });

    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "joao", password: "wrong" })
      .expect(401, { status: 401, code: "UNAUTHORIZED", message: "Invalid credentials" });

    await request(app.getHttpServer()).get("/users").set("Authorization", "Bearer not-a-jwt").expect(401);

    const expired = signJwt({ sub: createRes.body.id }, "tylon-stress-test-dev-secret", -10);
    await request(app.getHttpServer()).get("/users").set("Authorization", `Bearer ${expired}`).expect(401);

    await request(app.getHttpServer()).get("/users").set("Authorization", `Bearer ${token}`).expect(200);
  });
});

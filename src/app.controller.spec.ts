import { AppController } from "./app.controller";

describe("AppController", () => {
  it("should be defined", () => {
    expect(new AppController()).toBeDefined();
  });

  it("returns the provided json body", () => {
    expect(new AppController().jsonBody({ name: "Ada" })).toEqual({
      body: { name: "Ada" },
    });
  });
});

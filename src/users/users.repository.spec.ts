import { UsersRepository, UserNotFoundError } from "./users.repository";

describe("UsersRepository (in-memory)", () => {
  it("creates, reads, updates and deletes", () => {
    const repo = new UsersRepository();

    const user = repo.create({ name: "João", email: "joao@example.com" }, "u1");
    expect(user).toEqual({ id: "u1", name: "João", email: "joao@example.com" });

    expect(repo.getById("u1")).toEqual(user);

    const updated = repo.update("u1", { name: "João P." });
    expect(updated).toEqual({ id: "u1", name: "João P.", email: "joao@example.com" });

    repo.delete("u1");
    expect(() => repo.getById("u1")).toThrow(UserNotFoundError);
  });

  it("throws when deleting unknown user", () => {
    const repo = new UsersRepository();
    expect(() => repo.delete("missing")).toThrow(UserNotFoundError);
  });
});

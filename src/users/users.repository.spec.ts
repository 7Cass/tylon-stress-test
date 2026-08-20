import { UsersRepository, UserNotFoundError } from "./users.repository";

describe("UsersRepository (in-memory)", () => {
  it("creates, reads, updates and deletes", async () => {
    const repo = new UsersRepository();

    const user = await repo.create(
      { name: "João", email: "joao@example.com", password: "pw" },
      "u1",
    );
    expect(user).toEqual({
      id: "u1",
      name: "João",
      email: "joao@example.com",
      password: user.password,
    });

    expect(repo.getById("u1")).resolves.toEqual(user);

    const updated = await repo.update("u1", { name: "João P." });
    expect(updated).toEqual({
      id: "u1",
      name: "João P.",
      email: "joao@example.com",
      password: user.password,
    });

    await repo.delete("u1");
    await expect(repo.getById("u1")).rejects.toThrow(UserNotFoundError);
  });

  it("throws when deleting unknown user", async () => {
    const repo = new UsersRepository();
    await expect(repo.delete("missing")).rejects.toThrow(UserNotFoundError);
  });
});

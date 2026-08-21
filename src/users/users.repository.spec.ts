import { UsersRepository, UserNotFoundError } from "./users.repository";

describe("UsersRepository (in-memory)", () => {
  it("creates, reads, updates and deletes", async () => {
    const repo = new UsersRepository();

    const user = await repo.create({
      name: "João",
      email: "joao@example.com",
      username: "joao",
      password: "pw",
    });

    expect(user).toMatchObject({
      name: "João",
      email: "joao@example.com",
      username: "joao",
    });
    expect(user.password).toBeDefined();

    await expect(repo.getById(user.id)).resolves.toEqual(user);

    const updated = await repo.update(user.id, { name: "João P." });
    expect(updated).toMatchObject({
      id: user.id,
      name: "João P.",
      email: "joao@example.com",
      username: "joao",
    });

    await repo.delete(user.id);
    await expect(repo.getById(user.id)).rejects.toThrow(UserNotFoundError);
  });

  it("throws when deleting unknown user", async () => {
    const repo = new UsersRepository();
    await expect(repo.delete("missing")).rejects.toThrow(UserNotFoundError);
  });
});

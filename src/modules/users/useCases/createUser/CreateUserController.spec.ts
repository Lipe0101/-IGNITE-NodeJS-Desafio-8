import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a new user", async () => {
    const user = {
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    };

    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toEqual(201);
  });

  it("should not be able create a new user with same email", async () => {
    const user = {
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(user);
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toEqual(400);
  });
});

import exp from "constants";
import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show profile User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able show user profile", async () => {
    const user = {
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send(user);

    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toEqual(200);
    expect(response.body.email).toEqual(user.email);
    expect(response.body.name).toEqual(user.name);
  });

  it("should not be able show un-exists user", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer false token`,
    });

    expect(response.status).toEqual(401);
  });
});

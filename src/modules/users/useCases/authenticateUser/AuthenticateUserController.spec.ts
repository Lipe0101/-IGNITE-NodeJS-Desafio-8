import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = v4();
    const passwordHash = await hash("user", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) VALUES ('${id}', 'user', 'user@mail.com.br', '${passwordHash}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@mail.com.br",
      password: "user",
    });

    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toEqual("user@mail.com.br");
    expect(response.status).toEqual(200);
  });

  it("should not be able authenticate user with wrong email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong@mail.com.br",
      password: "user",
    });

    expect(response.status).toEqual(401);
  });

  it("should not be able authenticate user with wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@mail.com.br",
      password: "wrong password",
    });

    expect(response.status).toEqual(401);
  });
});

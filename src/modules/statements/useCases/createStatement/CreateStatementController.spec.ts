import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

interface IUser {
  id: string;
  email: string;
  password: string;
}

let connection: Connection;
let user: IUser;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      id: v4(),
      email: "user@mail.com.br",
      password: "user",
    };

    const passwordHash = await hash(user.password, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) VALUES ('${user.id}', 'user', '${user.email}', '${passwordHash}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a new Statement", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseAuth.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Statement Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toEqual(201);
  });

  it("should not be able create a new Statement to un-exists user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Statement Test",
      })
      .set({
        Authorization: `Bearer INVALID TOKEN`,
      });

    expect(response.status).toEqual(401);
  });

  it("should not be able withdraw money with insufficient funds", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseAuth.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "Statement Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toEqual(400);
  });
});

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

describe("Get Balance Controller", () => {
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

  it("should be able get user balance", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseAuth.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toEqual(200);
    expect(response.body.statement).toEqual([]);
    expect(response.body.balance).toEqual(0);
  });

  it("should not be able get un-exists user balance", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer INVALID TOKEN`,
    });

    expect(response.status).toEqual(401);
  });
});

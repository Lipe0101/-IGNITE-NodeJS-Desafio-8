import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able create a new Statement", async () => {
    const user = {
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const statement = {
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Statement Test",
    };

    const statementCreated = await createStatementUseCase.execute(statement);

    expect(statementCreated).toHaveProperty("id");
    expect(statementCreated.user_id).toEqual(userCreated.id);
    expect(statementCreated.amount).toEqual(statement.amount);
  });

  it("should not be able create a new Statement to un-exists user", async () => {
    const statement = {
      user_id: "WRONG ID",
      type: "deposit" as OperationType,
      amount: 100,
      description: "Statement Test",
    };

    expect(async () => {
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able withdraw money with insufficient funds", async () => {
    const user = {
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const statement = {
      user_id: userCreated.id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Statement Test",
    };

    expect(async () => {
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
});

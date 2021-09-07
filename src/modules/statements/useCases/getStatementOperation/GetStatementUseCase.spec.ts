import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperation: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperation = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able get statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Statement Test",
    });

    const getStatement = await getStatementOperation.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(getStatement.id).toEqual(statement.id);
    expect(getStatement.user_id).toEqual(user.id);
    expect(getStatement.amount).toEqual(statement.amount);
  });

  it("should not be able get statement with un-exists user", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Statement Test",
    });

    expect(async () => {
      await getStatementOperation.execute({
        user_id: "WRONG ID",
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able get statement with un-exists statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Statement Test",
    });

    expect(async () => {
      await getStatementOperation.execute({
        user_id: user.id,
        statement_id: "WRONG ID",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});

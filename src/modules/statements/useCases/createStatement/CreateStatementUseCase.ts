import { inject, injectable } from "tsyringe";

import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    sender_id,
  }: ICreateStatementDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (sender_id === user_id) {
      throw new AppError("You can't transfer for yourself");
    }

    if (sender_id) {
      const dest_id = await this.usersRepository.findById(sender_id);
      if (!dest_id) throw new AppError("Destination user dont exists!");
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    if (type === "transfer") {
      await this.statementsRepository.create({
        user_id: sender_id,
        type,
        amount,
        description,
        sender_id: user_id,
      });
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id: user_id,
    });

    return statementOperation;
  }
}

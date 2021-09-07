import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@mail.com.br",
      password: "123456",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile.id).toEqual(user.id);
    expect(userProfile.email).toEqual(user.email);
  });

  it("should not be able show un-exists user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("wrong id");
    }).rejects.toBeInstanceOf(AppError);
  });
});

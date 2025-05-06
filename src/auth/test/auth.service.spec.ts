import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../../users/schema/user.schema";

describe("AuthService", () => {
  let service: AuthService;

  const mockUserModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve(dto))
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ],
    })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {

    it("should create a new user and return token", async () => {
      const inputDto = {
        firstName: "Abdelrahman",
        lastName: "Sameeh",
        email: "a.sameeh.dev@gmail.com",
        username: "a.sameeh",
        password: "0000",
      };

    });
  });
});

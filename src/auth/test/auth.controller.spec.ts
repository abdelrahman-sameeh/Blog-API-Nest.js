import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller"
import { AuthService } from "../auth.service";
import { CreateUserDto } from "../dto/create-user.dto";

describe("AuthController", () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(async (dto: CreateUserDto) => {
      const { email, username } = dto
      if (email === "existing@gmail.com") {
        throw new Error("Email is already in use");
      }
      if (username === "existingUser") {
        throw new Error("Username is already in use");
      }

      const { password, ...user } = dto;
      return {
        data: {
          user,
          token: 'mocked-token',
        }
      };
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("register", () => {

    it("should register a user successfully", async () => {
      const inputDto = {
        firstName: "Abdelrahman",
        lastName: "Sameeh",
        email: "a.sameeh.dev@gmail.com",
        username: "a.sameeh",
        password: "0000",
      };

      const result = await controller.register(inputDto);

      expect(result).toEqual({
        data: {
          user: {
            firstName: "Abdelrahman",
            lastName: "Sameeh",
            email: "a.sameeh.dev@gmail.com",
            username: "a.sameeh",
          },
          token: 'mocked-token',
        },
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(inputDto); // التأكد من صحة الاستدعاء
    });

    it("should throw an error when the email already exists", async () => {
      const inputDto = {
        firstName: "Abdelrahman",
        lastName: "Sameeh",
        email: "existing@gmail.com",
        username: "a.sameeh",
        password: "0000",
      };

      await expect(controller.register(inputDto)).rejects.toThrow(
        "Email is already in use"
      );
    })

    it("should throw an error when the username already exists", async () => {
      const inputDto = {
        firstName: "Abdelrahman",
        lastName: "Sameeh",
        email: "a.sameeh.dev@gmail.com",
        username: "existingUser",
        password: "0000",
      };

      await expect(controller.register(inputDto)).rejects.toThrow(
        "Username is already in use"
      );
    })

  })

});

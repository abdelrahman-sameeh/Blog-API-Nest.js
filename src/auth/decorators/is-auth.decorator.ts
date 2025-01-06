import { SetMetadata } from "@nestjs/common";
import { IS_AUTH } from "src/common/constant";

export const IsAuth = () => SetMetadata(IS_AUTH, true)
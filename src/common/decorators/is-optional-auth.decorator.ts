import { SetMetadata } from "@nestjs/common";
import { IS_OPTIONAL_AUTH } from "../constant";


export const IsOptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH, true);

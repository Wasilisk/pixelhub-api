import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {SignupDto} from "../../auth/dto";
import {UserPayload} from "../../auth/types/user-payload.types";

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest();
    return  request.user as SignupDto;
  },
);
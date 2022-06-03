import { JwtPayload } from '.';

export type JwtPayloadWithRtTypes = JwtPayload & { refreshToken: string };
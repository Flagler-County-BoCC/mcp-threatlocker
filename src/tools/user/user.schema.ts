import { z } from 'zod';

export const UserGetAllTimezonesSchema = z.object({});

export const UserInviteByUsernameSchema = z.object({
  email: z.string().email(),
});

export type UserGetAllTimezonesInput = z.infer<typeof UserGetAllTimezonesSchema>;
export type UserInviteByUsernameInput = z.infer<typeof UserInviteByUsernameSchema>;

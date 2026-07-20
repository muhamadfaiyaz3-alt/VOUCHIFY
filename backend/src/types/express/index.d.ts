import type { IUser } from "../../models/User";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      currentUser?: IUser;
      firebaseUid?: string;
    }
  }
}

export {};


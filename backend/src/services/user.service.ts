import { FilterQuery, UpdateQuery } from "mongoose";
import { UserModel, IUser } from "../models/User";
import { WalletModel } from "../models/Wallet";
import Env from "../config/env";

type FirebaseProfile = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  phone_number?: string;
};

export const upsertUserFromFirebase = async (
  profile: FirebaseProfile
): Promise<IUser> => {
  const update: UpdateQuery<IUser> = {
    email: profile.email ?? "",
    displayName: profile.name ?? profile.email ?? "User",
    avatarUrl: profile.picture,
    phone: profile.phone_number,
  };

  const user = await UserModel.findOneAndUpdate(
    { firebaseUid: profile.uid },
    { $setOnInsert: { role: "user" }, $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await WalletModel.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { balance: 0, currency: Env.defaultCurrency } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
};

export const getCurrentUser = async (id: string) => {
  return UserModel.findById(id);
};

export const updateProfile = async (id: string, payload: Partial<IUser>) => {
  const allowed: (keyof IUser)[] = [
    "displayName",
    "avatarUrl",
    "phone",
    "bio",
    "businessName",
    "businessWebsite",
    "settings",
    "address",
    "gender",
    "dob",
    "occupation",
    "identityProofUrl",
    "description",
    "identityProofUrl",
    "description",
    "email",
    "payoutSettings"
  ];

  const update: Partial<IUser> = {};
  allowed.forEach((key) => {
    if (payload[key] !== undefined) {
      if (key === 'dob' && (payload[key] as any) === "") {
        // Skip empty string for date to avoid CastError
        return;
      }
      (update as Record<string, unknown>)[key] = payload[key];
    }
  });

  return UserModel.findByIdAndUpdate(id, update, { new: true });
};

export const listUsers = async (filters: FilterQuery<IUser>) => {
  return UserModel.find(filters).sort({ createdAt: -1 });
};


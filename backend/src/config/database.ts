import mongoose from "mongoose";
import Env from "./env";

mongoose.set("strictQuery", true);

export const connectDatabase = async () => {
  await mongoose.connect(Env.mongoUri, {
    autoIndex: Env.isDev,
  });
  if (Env.isDev) {
    console.log(`[database] connected to ${Env.mongoUri}`);
  }
};

export default mongoose;


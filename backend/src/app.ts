import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";

import Env from "./config/env";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
  Env.frontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://vouchify-self.vercel.app",
  "https://vouchify-pnshv3x4f-get-vouchify.vercel.app",
  "https://vouchify-git-main-get-vouchify.vercel.app"
],
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(Env.isDev ? "dev" : "combined"));

app.use(router);
app.use(errorHandler);

export default app;


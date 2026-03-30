import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import morgan from "morgan";

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(morgan("dev"))

app.use("/api", routes);

export default app;

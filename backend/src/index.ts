import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8081",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
    res.send("NetWorth API is running!");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

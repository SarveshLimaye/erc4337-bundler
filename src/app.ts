import express from "express";
import bodyParser from "body-parser";
import { sendUserOpHandler } from "./controllers/userOpController";
import cors from "cors";

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
// POST /bundler - Send User Operation
app.post("/bundler", sendUserOpHandler);
export default app;

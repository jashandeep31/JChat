import express from "express";
import cors from "cors";
import { db } from "./lib/db.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.get("/delete", async (req, res) => {
  await db.chatQuestionAnswer.deleteMany();
  await db.chatQuestion.deleteMany();
  await db.chat.deleteMany();
  await db.project.deleteMany();

  res.send("Deleted");
});

export default app;

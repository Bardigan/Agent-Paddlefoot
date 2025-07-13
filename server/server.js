import express from "express";
import records from "./routes/record.js";
import auth from "./routes/auth.js";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/auth.js";
import { corsMiddleware } from "./config/cors.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/auth", auth);
app.use("/score", authenticateToken, records);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

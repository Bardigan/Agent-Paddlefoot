import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import db from "./db/connection.js";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";

dotenv.config();

const secretKey = process.env.JWT_SECRET;
const PORT = process.env.PORT || 8080;
const app = express();

const generateToken = (user) => {
  const payload = { userId: user._id, username: user.username };
  const options = { expiresIn: '8h' };
  return jwt.sign(payload, secretKey, options);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use("/score", authenticateToken, records);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post(
  "/login",
  [
    body("username").trim().escape().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const usersCollection = await db.collection("users");

      const user = await usersCollection.findOne({ username });

      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.json({ token });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post(
  "/register",
  [
    body("username").trim().escape().notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const usersCollection = await db.collection("users");

      const existingUser = await usersCollection.findOne({ username });

      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser = {
        username,
        password: hashedPassword,
      };

      const result = await usersCollection.insertOne(newUser);

      const token = generateToken({ _id: result.insertedId, username: newUser.username });

      res.status(201).json({ token });
    } finally {
      // No need to close the connection here, as it's handled by the MongoDB driver
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

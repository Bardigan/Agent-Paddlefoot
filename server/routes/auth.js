import express from "express";
import db from "../db/connection.js";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { generateToken } from "../middleware/auth.js";

const router = express.Router();

router.post(
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

router.post(
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;

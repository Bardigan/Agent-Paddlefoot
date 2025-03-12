import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import db from "./db/connection.js";

dotenv.config();

const secretKey = process.env.JWT_SECRET;
const PORT = process.env.PORT || 8080;
const app = express();

const generateToken = (user) => {
  const payload = { userId: user._id, username: user.username };
  const options = { expiresIn: '8h' }; // Token expiration time
  return jwt.sign(payload, secretKey, options);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = user;
    next();
  });
};

app.use(cors());
app.use(express.json());
app.use("/score", authenticateToken, records);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersCollection = await db.collection('users');

    // Find user in the database
    const user = await usersCollection.findOne({ username, password });

    if (user) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } finally {
    //await client.close();
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersCollection = await db.collection('users');

    // Check if the username already exists
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" }); // Conflict
    }

    // Create a new user
    const newUser = {
      username,
      password
    };

    // Add the new user to the database
    const result = await usersCollection.insertOne(newUser);

    // Generate a token for the new user
    const token = generateToken({ _id: result.insertedId, username: newUser.username });

    res.status(201).json({ token }); // Created
  } finally {
    //await client.close();
  }
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

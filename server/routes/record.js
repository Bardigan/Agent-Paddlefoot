import express from "express";
import db from "../db/connection.js";
import jwt from "jsonwebtoken"; // Assuming you're using JWT for tokens

const router = express.Router();

// Middleware to validate Authorization header
const validateAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: Missing or invalid token");
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
    req.userId = decoded.userId; // Assuming the token contains the user ID
    req.username = decoded.username; // Assuming the token contains the username
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

// Submit a new score
router.post("/", validateAuth, async (req, res) => {
  try {
    const { score } = req.body;

    if (typeof score !== "number") {
      return res.status(400).send("Invalid input");
    }

    const bestScoresCollection = await db.collection("player_best_scores");

    // Check if the player already has a best score
    const playerBest = await bestScoresCollection.findOne({ userId: req.userId });

    if (!playerBest || score > playerBest.bestScore) {
      // Update or insert the player's best score
      await bestScoresCollection.updateOne(
        { userId: req.userId },
        { $set: { bestScore: score, updatedAt: new Date(), username: req.username } },
        { upsert: true }
      );
    }

    res.status(200).send("Score submitted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting score");
  }
});

// Get the best score across all players
router.get("/best", validateAuth, async (req, res) => {
  try {
    const bestScoresCollection = await db.collection("player_best_scores");

    // Find the player with the highest score
    const bestScore = await bestScoresCollection
      .find()
      .sort({ bestScore: -1 })
      .limit(1)
      .toArray();

    if (bestScore.length === 0) {
      return res.status(200).send({ message: "No scores found", bestScore: 0 });
    }

    res.status(200).send(bestScore[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving best score");
  }
});

// Get all players' best scores
router.get("/best/all", validateAuth, async (req, res) => {
  try {
    const bestScoresCollection = await db.collection("player_best_scores");

    // Retrieve all best scores, sorted by score in descending order
    const allBestScores = await bestScoresCollection
      .find()
      .sort({ bestScore: -1 })
      .toArray();

    res.status(200).send(allBestScores);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving all best scores");
  }
});


export default router;

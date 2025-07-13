import express from "express";
import db from "../db/connection.js";
import { validateAuth } from "../middleware/auth.js";

const router = express.Router();


router.post("/", validateAuth, async (req, res) => {
  try {
    const { score } = req.body;

    if (typeof score !== "number") {
      return res.status(400).send("Invalid input");
    }

    const bestScoresCollection = await db.collection("player_best_scores");
    const playerBest = await bestScoresCollection.findOne({ userId: req.userId });

    if (!playerBest || score > playerBest.bestScore) {
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

router.get("/best", validateAuth, async (req, res) => {
  try {
    const bestScoresCollection = await db.collection("player_best_scores");

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

router.get("/best/all", validateAuth, async (req, res) => {
  try {
    const bestScoresCollection = await db.collection("player_best_scores");

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

import express from "express";
import { indexes } from "../config/indexes.js";
import { getIndexData } from "../services/marketData.service.js";

const router = express.Router();

let portfolioCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000;

router.get("/portfolio", async (req, res) => {
  const now = Date.now();

  if (portfolioCache && now - cacheTimestamp < CACHE_TTL) {
    return res.json(portfolioCache);
  }

  try {
    console.log("Fetching fresh portfolio data...");

    const portfolio = [];

    for (const index of indexes) {
      const data = await getIndexData(index.symbol);

      portfolio.push({
        name: index.name,
        symbol: index.symbol,
        type: index.type,
        ...data
      });
    }

    portfolioCache = portfolio;
    cacheTimestamp = now;

    res.json(portfolio);
  } catch (err) {
    console.error(err);

    if (portfolioCache) {
      return res.json(portfolioCache);
    }

    res.status(500).json({ error: err.message });
  }
});

export default router;

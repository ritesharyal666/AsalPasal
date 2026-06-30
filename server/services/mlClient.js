/**
 * Thin HTTP client for the Python ML recommender microservice.
 * Each call returns an array of { productId, score } ranked best-first.
 * Throws on network/timeout error so the caller can fall back.
 */
const axios = require("axios");

const ML_URL = process.env.RECOMMENDER_URL || "http://localhost:8000";
const TIMEOUT = parseInt(process.env.RECOMMENDER_TIMEOUT_MS) || 4000;

async function getRelated(productId, limit) {
  const { data } = await axios.get(`${ML_URL}/related/${productId}`, {
    params: { limit },
    timeout: TIMEOUT,
  });
  return data?.data || [];
}

async function getForYou(userId, limit) {
  const params = { limit };
  if (userId) params.userId = userId;
  const { data } = await axios.get(`${ML_URL}/for-you`, {
    params,
    timeout: TIMEOUT,
  });
  return data?.data || [];
}

async function getFrequentlyBought(productIds, limit) {
  const { data } = await axios.post(
    `${ML_URL}/frequently-bought-together`,
    { productIds, limit },
    { timeout: TIMEOUT }
  );
  return data?.data || [];
}

module.exports = { getRelated, getForYou, getFrequentlyBought, ML_URL };

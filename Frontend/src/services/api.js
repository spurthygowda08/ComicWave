// ==============================
// 🌐 API CONFIG
// ==============================
import axios from "axios";

const API_URL = "http://localhost:8000"; // ✅ correct

const api = axios.create({
  baseURL: API_URL,
});

// ==============================
// 🎮 UNIVERSE API
// ==============================
export const universeApi = {
  generate: async () => {
    const res = await api.post("/api/universe/generate");
    return res.data;
  },
};

// ==============================
// 📖 STORY API (FIXED)
// ==============================
export const storyApi = {
  start: async (sessionId) => {
    const res = await api.post(
      "/api/chat",
      {
        message: "Start the story",
        characters: "",
        panels: 6,
        style: "comic",
      },
      {
        headers: {
          "x-session-id": sessionId, // ✅ VERY IMPORTANT
        },
      }
    );

    return res.data;
  },
};

require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Неверный формат сообщений"
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "API-ключ не найден в .env"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.MODEL,
          messages: [
            {
              role: "system",
              content: "Ты NEON AI. Отвечай на русском языке."
            },
            ...messages.slice(-20)
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("OPENROUTER STATUS:", response.status);
      console.log("OPENROUTER ERROR:", data);

      return res.status(502).json({
        error: data.error?.message || "Ошибка OpenRouter"
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "Пустой ответ"
    });

  } catch (error) {
    console.log("SERVER ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(3000, "127.0.0.1", () => {
  console.log("NEON AI запущен: http://localhost:3000");
});


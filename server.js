const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Arquivo de log
const logFile = path.join(__dirname, "access.log");

app.get("/", (req, res) => {
  res.send("Assistente de IA rodando.");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();
    const accessCode = req.body.accessCode || "SEM_CODIGO";

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "IP_DESCONHECIDO";

    // Registrar log de acesso
    const logLine = `${new Date().toISOString()} | ${accessCode} | ${ip}\n`;
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error("Erro ao gravar log:", err);
    });

    if (
      userMessage.includes("imagem") ||
      userMessage.includes("foto") ||
      userMessage.includes("crie uma imagem")
    ) {
      res.json({
        response: "Desculpe, este assistente gera apenas textos e não imagens."
      });
    } else {
      const chatResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente de criação de conteúdo profissional para LinkedIn e Instagram."
          },
          { role: "user", content: req.body.message }
        ]
      });

      res.json({
        response: chatResponse.choices[0].message.content
      });
    }
  } catch (error) {
    console.error("Erro OpenAI:", error);
    res.status(500).json({
      error: error.message || "Erro desconhecido"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

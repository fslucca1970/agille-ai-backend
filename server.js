const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Assistente de IA rodando.");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();

    if (userMessage.includes("imagem") || userMessage.includes("foto") || userMessage.includes("crie uma imagem")) {
      // Geração de imagem
      const imageResponse = await client.images.generate({
        prompt: req.body.message,
        n: 1,
        size: "512x512"
      });
      const imageUrl = imageResponse.data[0].url;

      res.json({
        response: "Aqui está a imagem que você pediu:",
        image_url: imageUrl
      });

    } else {
      // Geração de texto
      const chatResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um assistente de criação de conteúdo profissional para LinkedIn e Instagram."
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

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});

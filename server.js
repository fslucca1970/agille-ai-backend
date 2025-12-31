const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * CÓDIGOS DE ACESSO VÁLIDOS
 * Cada cliente recebe um código.
 * Basta adicionar ou remover itens deste array.
 */
const ACCESS_CODES = [
  "AGILLE-CLIENTE-001",
  "AGILLE-CLIENTE-002",
  "AGILLE-TESTE",
  "AGILLE-INTERNO"
];

app.get("/", (req, res) => {
  res.send("Assistente de IA rodando.");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, accessCode } = req.body;

    // 1️⃣ Validação do código de acesso
    if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
      return res.status(403).json({
        response: "Acesso negado. Código de acesso inválido ou não informado."
      });
    }

    const userMessage = message.toLowerCase();

    // 2️⃣ Bloqueio de pedidos de imagem
    if (
      userMessage.includes("imagem") ||
      userMessage.includes("foto") ||
      userMessage.includes("crie uma imagem")
    ) {
      return res.json({
        response: "Desculpe, este assistente gera apenas textos e não imagens."
      });
    }

    // 3️⃣ Geração de texto normal
    const chatResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de criação de conteúdo profissional para LinkedIn e Instagram."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      response: chatResponse.choices[0].message.content
    });
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


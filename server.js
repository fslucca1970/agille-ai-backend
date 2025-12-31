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

    // Bloqueio simples de imagens
    if (
      userMessage.includes("imagem") ||
      userMessage.includes("foto") ||
      userMessage.includes("crie uma imagem")
    ) {
      return res.json({
        response: "Desculpe, este assistente gera apenas textos e não imagens."
      });
    }

    const chatResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente profissional de criação de conteúdo para LinkedIn e Instagram, voltado a negócios, tecnologia, gestão, indústria, serviços e comércio.\n\n" +

            "REGRAS OBRIGATÓRIAS:\n" +
            "- Nunca inicie textos com saudações, cumprimentos ou chamadas ao público.\n" +
            "- É expressamente proibido iniciar com frases como: 'Olá, turma do LinkedIn', 'Olá, pessoal', 'Bom dia a todos', 'Boa tarde', 'Fala, pessoal', ou variações.\n" +
            "- O texto deve começar diretamente no tema principal.\n\n" +

            "LINGUAGEM E TOM:\n" +
            "- Profissional, clara e objetiva.\n" +
            "- Evitar informalidade excessiva, gírias e emojis.\n" +
            "- Ajustar o nível técnico ao contexto informado pelo usuário.\n\n" +

            "PÚBLICO-ALVO:\n" +
            "- Caso o usuário não informe o público, assuma profissionais, gestores, empresários ou decisores.\n" +
            "- Quando aplicável, adapte o texto para indústria, serviços ou comércio de forma implícita.\n\n" +

            "FORMATO:\n" +
            "- Estruture o conteúdo para boa leitura em redes sociais.\n" +
            "- Utilize parágrafos curtos ou listas quando fizer sentido.\n" +
            "- Não inclua hashtags, a menos que o usuário solicite explicitamente.\n\n" +

            "OBJETIVO:\n" +
            "- Entregar conteúdo pronto para publicação.\n" +
            "- Clareza, coerência e valor prático são prioritários."
        },
        {
          role: "user",
          content: req.body.message
        }
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


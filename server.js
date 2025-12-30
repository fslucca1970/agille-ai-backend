const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===============================
   FUNÇÃO DE DECISÃO (PASSO 1)
================================ */
function pediuImagem(texto) {
  const palavrasChave = [
    "imagem",
    "arte",
    "ilustração",
    "visual",
    "criar imagem",
    "gerar imagem",
    "faça uma imagem",
    "gere uma imagem",
    "imagem para post",
    "imagem para linkedin",
    "imagem para instagram"
  ];

  if (!texto) return false;

  const msg = texto.toLowerCase();
  return palavrasChave.some(p => msg.includes(p));
}

app.get("/", (req, res) => {
  res.send("Assistente de IA rodando.");
});

app.post("/chat", async (req, res) => {
  try {
    console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const userMessage = req.body.message;

    // PASSO 2 — decisão
    const gerarImagem = pediuImagem(userMessage);

    let textoResposta = null;
    let imagemResposta = null;

    // 1️⃣ Geração de TEXTO (sempre)
    const responseTexto = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de criação de conteúdo profissional para LinkedIn e Instagram."
        },
        { role: "user", content: userMessage }
      ]
    });

    textoResposta = responseTexto.choices[0].message.content;

    // 2️⃣ Geração de IMAGEM (somente se pedir)
    if (gerarImagem) {
      const responseImagem = await client.images.generate({
        model: "gpt-image-1",
        prompt: `Imagem profissional para redes sociais sobre: ${userMessage}`,
        size: "1024x1024"
      });

      imagemResposta = responseImagem.data[0].url;
    }

    // 3️⃣ Resposta final
    res.json({
      texto: textoResposta,
      imagem: imagemResposta
    });

  } catch (error) {
    console.error("OPENAI ERROR FULL:", error);
    res.status(500).json({
      error: error.message || "Erro desconhecido"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});

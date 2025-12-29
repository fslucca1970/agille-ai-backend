app.post("/chat", async (req, res) => {
  try {
    console.log("API KEY:", process.env.OPENAI_API_KEY);

    const userMessage = req.body.message;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente de criação de conteúdo profissional." },
        { role: "user", content: userMessage }
      ]
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("ERRO OPENAI:", error.message);
    res.status(500).json({ error: error.message });
  }
});

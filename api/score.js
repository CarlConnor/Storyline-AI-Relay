import OpenAI from "openai";

// Make sure you have OPENAI_API_KEY set in Vercel
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { secret, question, userAnswer, modelAnswer } = req.body;

  // Check the relay secret
  if (secret !== process.env.RELAY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const prompt = `
    Question: ${question}
    Model answer: ${modelAnswer}
    Learner answer: ${userAnswer}
    Provide concise feedback highlighting correctness and improvement areas.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200
    });

    const feedback = completion.choices[0].message.content.trim();

    return res.status(200).json({ feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// api/score.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Pull data from POST body
    const { secret, question, userAnswer, modelAnswer } = req.body;

    // Check relay secret
    if (secret !== process.env.RELAY_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey: process.env.StorylineAPIKey });

    // Send prompt to OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business tutor providing feedback on short answers."
        },
        {
          role: "user",
          content: `Question: ${question}\nModel answer: ${modelAnswer}\nStudent answer: ${userAnswer}\nProvide constructive feedback.`
        }
      ],
      temperature: 0.7,
    });

    // Extract feedback
    const feedback = completion.choices[0].message.content;

    // Return feedback as JSON
    res.status(200).json({ feedback });
  } catch (err) {
    console.error("Relay function error:", err);
    res.status(500).json({ error: err.message || err.toString() });
  }
}

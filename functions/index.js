const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.geminiReply = functions.https.onRequest(async (req, res) => {
  const userText = req.body.text;
  const language = req.body.language;

  let langInstruction = "";
  if (language === "hi") langInstruction = "Reply in Hindi.";
  if (language === "te") langInstruction = "Reply in Tenglish.";

  const prompt = `
You are a kind, empathetic mental health assistant for college students.
${langInstruction}
If the student sounds distressed, gently suggest professional help.
Student message: ${userText}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=mental-health-chatbot-key`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Gemini failed" });
  }
});

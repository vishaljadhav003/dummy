const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactController");
const auth = require("../middleware/auth");
const db = require("../config/db");

const franc = require("franc");
const pdfParse = require("pdf-parse");

// ============================================================
// CONTACT
// ============================================================

router.post("/contact", contactController.createContact);

// ============================================================
// PROTECTED ADMIN ROUTES
// ============================================================

router.get("/admin", auth, contactController.getContacts);

router.get("/complete/:id", contactController.markComplete);

router.get("/delete/:id", contactController.deleteContact);

// ============================================================
// LOGIN PAGE
// ============================================================

router.get("/login", (req, res) => {
  res.render("login");
});

// ============================================================
// LOGIN POST
// ============================================================

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql =
    "SELECT * FROM admin WHERE username=? AND password=?";

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("❌ Login DB Error:", err);
      return res.status(500).send("Server error");
    }

    if (result.length > 0) {
      req.session.user = result[0];
      req.session.isAuth = true;

      return res.redirect("/api/admin");
    }

    return res.send("Invalid credentials");
  });
});

// ============================================================
// AI CHAT
// ============================================================

router.post("/chat", async (req, res) => {
  const { message, image, pdf } = req.body;

  try {
    // ========================================================
    // LANGUAGE DETECTION
    // ========================================================

    const langCode = franc(message || "");

    // Strong Hinglish detection
    const hinglishWords = [
      "kya",
      "hai",
      "kaise",
      "tum",
      "aap",
      "mera",
      "meri",
      "kar",
      "raha",
      "kyu",
      "ka",
      "ki",
      "ke",
      "hona",
      "bata",
      "bolo",
      "samajh",
      "chal",
      "de",
      "le",
    ];

    const lowerMessage = (message || "").toLowerCase();

    const isHinglish = hinglishWords.some((word) =>
      lowerMessage.includes(word)
    );

    // ========================================================
    // MOTIONPIX SERVICES
    // ========================================================

    const servicesList = `
Animations,
AR/VR,
Web Design,
Branding,
Print Media,
SOP,
Motion Graphics,
Graphics Design,
Digital Marketing,
E-Learning,
Live Shoots
`;

    // ========================================================
    // LANGUAGE INSTRUCTION
    // ========================================================

    let langInstruction = "Reply in English.";

    if (isHinglish) {
      langInstruction =
        "Reply in Hinglish (Hindi written in English letters) ONLY.";
    } else if (langCode === "hin") {
      langInstruction =
        "Reply in Hindi using Devanagari script ONLY.";
    } else if (langCode === "mar") {
      langInstruction =
        "Reply in Marathi using Devanagari script ONLY.";
    }

    // ========================================================
    // PDF TEXT EXTRACTION
    // ========================================================

    let pdfText = "";

    if (pdf?.base64) {
      try {
        const base64Data = pdf.base64.split(",").pop();

        const buffer = Buffer.from(base64Data, "base64");

        const parsed = await pdfParse(buffer);

        // Keep prompt small
        pdfText = parsed.text.slice(0, 2000);
      } catch (pdfErr) {
        console.log("❌ PDF PARSE ERROR:", pdfErr);
      }
    }

    // ========================================================
    // USER CONTENT
    // ========================================================

    let userContent;

    if (image) {
      userContent = [
        {
          type: "text",
          text:
            message ||
            "Describe this image and answer anything relevant about it.",
        },
        {
          type: "image_url",
          image_url: {
            url: image,
          },
        },
      ];
    } else if (pdfText) {
      userContent = `
Document content:

${pdfText}

User question:
${message || "Summarize this document."}
`;
    } else {
      userContent = message || "";
    }

    // ========================================================
    // OPENROUTER REQUEST
    // ========================================================

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",

          // Optional OpenRouter attribution
          "HTTP-Referer": "https://motionpixindia.com",
          "X-Title": "MotionPix AI",
        },

        body: JSON.stringify({
          // ==================================================
          // FREE MODEL
          // ==================================================

           model: "openrouter/free",

          // Maximum response length
          max_tokens: 300,

          temperature: 0.7,

          messages: [
            {
              role: "system",

              content: `
You are MotionPix AI assistant.

CRITICAL LANGUAGE RULE:

${langInstruction}

You MUST reply ONLY in the same language/style used by the user.

Language mapping:

- Hinglish user → Hinglish ONLY
- Hindi user → Hindi ONLY
- Marathi user → Marathi ONLY
- English user → English ONLY

DO NOT translate.

DO NOT switch language.

DO NOT explain the language.

Examples:

User:
tum kya karte ho

Assistant:
hum animation aur web design services provide karte hain.

User:
mala sang kasa ahes

Assistant:
mi changla ahe, tumhala kasa madat karu?

Keep answers short, friendly and natural.

============================================================
MOTIONPIX SERVICES
============================================================

${servicesList}

============================================================
SERVICE RULE
============================================================

When the user asks about MotionPix services:

Always list ALL services properly.

Never remove services from the list.

============================================================
IMAGE & PDF
============================================================

You can understand images sent by the user.

You can answer questions about images naturally.

You can also answer questions using text extracted from PDFs.

============================================================
STRICT RESPONSE RULES
============================================================

- Reply ONLY to the latest user message.
- Do NOT include "User:".
- Do NOT include "Assistant:".
- Do NOT repeat the user's question.
- Do NOT simulate conversation.
- Do NOT give multiple answers.
- Do NOT translate the user's message.
- Do NOT add unnecessary explanation.
- Give ONE clean answer.
- Keep the response concise.

============================================================
CONTACT
============================================================

If the user asks for MotionPix contact details, reply ONLY:

Email: info@motionpixindia.com
Contact Number: +91 98220 55205

============================================================
`,
            },

            {
              role: "user",
              content: userContent,
            },
          ],
        }),
      }
    );

    // ========================================================
    // OPENROUTER ERROR HANDLING
    // ========================================================

    if (!response.ok) {
      const errorText = await response.text();

      console.log("❌ OPENROUTER ERROR:", errorText);

      let friendlyReply =
        "Sorry, the AI is temporarily unavailable. Please try again.";

      try {
        const parsedErr = JSON.parse(errorText);

        const errorCode = parsedErr?.error?.code;

        if (errorCode === 402) {
          friendlyReply =
            "Sorry, the AI usage limit has been reached. Please try again later.";
        }

        if (errorCode === 429) {
          friendlyReply =
            "The AI is currently busy. Please try again in a moment.";
        }
      } catch (parseError) {
        console.log("❌ Error parsing OpenRouter error:", parseError);
      }

      return res.status(200).json({
        reply: friendlyReply,
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    const data = await response.json();

    console.log("✅ AI RESPONSE:", data);

    let reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // ========================================================
    // CLEAN RESPONSE
    // ========================================================

    reply = reply
      .replace(/User:\s*/gi, "")
      .replace(/Assistant:\s*/gi, "")
      .trim();

    // ========================================================
    // SEND RESPONSE
    // ========================================================

    return res.json({
      reply,
    });
  } catch (err) {
    console.error("❌ Chat error:", err);

    return res.status(500).json({
      reply: "Error getting AI response. Please try again.",
    });
  }
});

// ============================================================
// LOGOUT
// ============================================================

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/api/login");
  });
});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;

console.log("🤖 OpenRouter AI Route Loaded ✅");
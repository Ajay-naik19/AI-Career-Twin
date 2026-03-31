require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const skillList = require("./skill.js");
const generateRoadmap = require("./utils/roadmapRules");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const upload = multer({ dest: "uploads/" });

const OCR_API_KEY = process.env.OCR_API_KEY;

/* ---------------- SKILL EXTRACTION ---------------- */

function extractSkills(text) {
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  skillList.forEach(skill => {
    if (lowerText.includes(skill)) {
      foundSkills.add(skill);
    }
  });

  return Array.from(foundSkills);
}

/* ---------------- SKILL COMPARISON ---------------- */

function compareSkills(resumeSkills, jdSkills) {
  const matched = resumeSkills.filter(skill =>
    jdSkills.includes(skill)
  );

  const missing = jdSkills.filter(skill =>
    !resumeSkills.includes(skill)
  );

  const matchPercent = jdSkills.length === 0
    ? 0
    : Math.round((matched.length / jdSkills.length) * 100);

  return { matched, missing, matchPercent };
}

/* ---------------- PDF OCR + ANALYSIS ---------------- */
async function generateRoadmapAI(data) {
  const normalizedMatchPercent = Number(String(data.matchPercent || 0).replace("%", "")) || 0;
  const prompt = `You are an expert career mentor.

Resume Text:
${data.extractedText}

Resume Skills:
${data.resumeSkills.join(", ")}

Job Description Skills:
${data.jdSkills.join(", ")}

Missing Skills:
${data.missingSkills.join(", ")}

Match Percentage:
${normalizedMatchPercent}%

Create a clear step-by-step career roadmap.
Explain why missing skills are important.
Suggest learning order and timeline.
Recommend projects.
Give resume improvement tips.
`;

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.4,
          return_full_text: false
        }
      })
    }
  );

  const result = await response.json();
  console.log("HF RESPONSE:", JSON.stringify(result, null, 2));
  console.log("HF RESULT:", result); 
  if (Array.isArray(result) && result[0]?.generated_text) {
    return result[0].generated_text;
  }

  return "⚠️ AI roadmap could not be generated.";
}





console.log("ENV CHECK:", {
  gemini: !!process.env.GEMINI_API_KEY,
  ocr: !!process.env.OCR_API_KEY
});


app.post("/extract-pdf", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Resume file is required" });
    }

    const filePath = req.file.path;
    const jdText = req.body.jd || "";

    // Convert PDF to base64
    const pdfBuffer = fs.readFileSync(filePath);
    const base64PDF = pdfBuffer.toString("base64");

    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("language", "eng");
    formData.append(
      "base64image",
      `data:application/pdf;base64,${base64PDF}`
    );
    formData.append("isOverlayRequired", true);
    formData.append("OCREngine", 2);
    formData.append("detectOrientation", true);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    console.log("OCR RESPONSE:", JSON.stringify(data, null, 2));

    fs.unlinkSync(filePath);

    let extractedText = "";
    if (data.ParsedResults && data.ParsedResults.length > 0) {
      extractedText = data.ParsedResults
        .map(r => r.ParsedText)
        .join("\n");
    }

    // 🔹 Extract skills
    const resumeSkills = extractSkills(extractedText);
    const jdSkills = extractSkills(jdText);

    // 🔹 Compare skills
    const comparison = compareSkills(resumeSkills, jdSkills);
    const roadmap = generateRoadmap(comparison.missing);
   res.json({
  success: true,
  extractedText,
  resumeSkills,
  jdSkills,
  matchedSkills: comparison.matched,
  missingSkills: comparison.missing,
  matchPercent: comparison.matchPercent,
  roadmap   // 👈 ADD THIS
});

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "PDF processing failed"
    });
  }
});
app.post("/generate-roadmap", express.json(), async (req, res) => {
  try {
   let roadmap;

try {
  roadmap = await generateRoadmapAI(req.body);

  if (!roadmap || roadmap.includes("could not be generated")) {
    roadmap = generateRoadmap(req.body.missingSkills);
  }

} catch (err) {
  roadmap = generateRoadmap(req.body.missingSkills);
}

res.json({ success: true, roadmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Roadmap generation failed"
    });
  }
});

/* ---------------- FRONTEND ---------------- */

app.get("/", (req, res) => {
  res.sendFile("D:\\AI Career Twin\\upload.html");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

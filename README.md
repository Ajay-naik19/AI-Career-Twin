# AI Career Twin

AI Career Twin is a Node.js + Express web app that analyzes a resume PDF against a target job description, extracts known skills, calculates a match score, and generates a career roadmap.

The project includes:
- Multi-page frontend (landing, features, how-it-works, upload, dashboard)
- Resume upload and OCR extraction pipeline
- Skill matching and gap analysis
- AI roadmap generation with fallback rules

## Tech Stack

- Backend: Node.js, Express
- Upload handling: Multer
- OCR: OCR.Space API
- AI text generation: Hugging Face Inference API (Mistral-7B-Instruct)
- Frontend: HTML, CSS, JavaScript, Chart.js, Font Awesome

## Project Structure

```text
.
|- server.js                  # Express server, OCR route, roadmap route
|- skill.js                   # Master skill dictionary used by server skill matching
|- upload.html                # Resume + JD submission page
|- dashboard.html             # Analysis dashboard + roadmap trigger
|- index.html                 # Landing page
|- features.html              # Features page
|- how-it-works.html          # Workflow page
|- utils/
|  |- roadmapRules.js         # Rule-based roadmap fallback
|  |- extractSkills.js        # Legacy/alternate skill extractor
|- uploads/                   # Temporary upload directory used by Multer
|- package.json
```

## How It Works

1. User uploads resume PDF and pastes job description on the upload page.
2. Frontend sends multipart request to `POST /extract-pdf`.
3. Backend sends PDF (base64) to OCR.Space and receives extracted text.
4. Resume skills and JD skills are extracted using keyword matching from `skill.js`.
5. Match, missing skills, and percentage are computed.
6. Frontend stores analysis in `sessionStorage` and opens the dashboard.
7. User clicks Generate Roadmap, frontend calls `POST /generate-roadmap`.
8. Backend attempts AI roadmap generation and falls back to rule-based roadmap if needed.

## API Endpoints

### `POST /extract-pdf`
Accepts:
- multipart form-data
- `resume`: PDF file
- `jd`: job description text

Returns:
- `extractedText`
- `resumeSkills`
- `jdSkills`
- `matchedSkills`
- `missingSkills`
- `matchPercent`
- `roadmap` (currently generated in-route, see report notes)

### `POST /generate-roadmap`
Accepts JSON:
- `extractedText`
- `resumeSkills`
- `jdSkills`
- `missingSkills`
- `matchPercent`

Returns:
- `roadmap`

## Setup

### Prerequisites

- Node.js 18+ (recommended)
- npm
- OCR.Space API key
- Hugging Face API key

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` in project root:

```env
OCR_API_KEY=your_ocr_space_api_key
HF_API_KEY=your_huggingface_api_key
```

### Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Known Limitations

- Skill extraction uses exact keyword matching only.
- No persistent database; results are session-based on frontend.
- No authentication or rate-limiting.
- Basic error handling and no automated tests yet.

See `PROJECT_REPORT.md` for a full technical assessment and recommendations.

## Suggested Next Improvements

- Improve extraction with NLP/embedding-based skill normalization
- Add input validation and file size/type safeguards on backend
- Add logging, monitoring, and request IDs
- Add tests (unit + integration)
- Persist analyses for user history and trend tracking

# AI Career Twin - Detailed Project Report

## 1. Executive Summary

AI Career Twin is a functional proof-of-concept that delivers resume-to-job-description matching with a modern dashboard UX. The application demonstrates a complete flow from file upload to OCR, skill extraction, match analytics, and roadmap generation.

The project is well positioned for iteration, but currently sits in an early-stage engineering state where reliability, security hardening, and test coverage need to be improved before production deployment.

## 2. Objectives and Scope

### Primary Objective

Provide users with an AI-assisted analysis that answers:
- How well does my resume match this role?
- Which skills am I missing?
- What should I learn next?

### Delivered Scope

- Resume PDF upload flow
- OCR extraction from uploaded PDF
- Skill extraction for resume and JD
- Match percentage computation
- Dashboard visualization with Chart.js
- AI roadmap generation with fallback logic

## 3. Current Architecture

### 3.1 High-Level Design

- Frontend: Static HTML pages served by Express
- Backend: Single Express server (`server.js`)
- External services:
  - OCR.Space for text extraction from PDF
  - Hugging Face Inference endpoint for roadmap text generation

### 3.2 Data Flow

1. User uploads PDF + JD text on `upload.html`
2. Frontend submits to `POST /extract-pdf`
3. Server converts PDF to base64 and sends request to OCR.Space
4. OCR text is parsed and merged
5. Skill extraction is run for OCR text and JD text
6. Skill comparison generates matched/missing and match score
7. Payload is returned to frontend and stored in `sessionStorage`
8. Dashboard renders stats and charts from session data
9. User triggers `POST /generate-roadmap` for AI roadmap

## 4. Module-Level Analysis

### 4.1 Backend (`server.js`)

Implemented responsibilities:
- Serves static frontend files
- Handles uploads via Multer
- Extracts skills via keyword matching
- Compares resume skills vs JD skills
- Calls external OCR and AI services
- Returns analysis and roadmap responses

Strengths:
- Simple and understandable flow
- Correctly deletes uploaded file after OCR request
- Provides fallback path for roadmap endpoint

Observations and issues:
- `POST /extract-pdf` currently sets `roadmap` using `generateRoadmap(comparison.missing)`, which returns rule-based array output and is not AI generation.
- `generateRoadmapAI` is asynchronous but not used inside `/extract-pdf`.
- Debug logging prints full external API responses, which can be noisy in production.
- Route root path uses an absolute Windows path for `upload.html`, reducing portability.

### 4.2 Skill Dictionary (`skill.js`)

Role:
- Defines controlled list of recognized skills.

Strengths:
- Centralized skill vocabulary
- Includes technical + soft skills

Limitations:
- No normalization or synonym mapping (for example `js` vs `javascript`, `node` vs `node.js`)
- Exact substring matching can produce false positives/negatives

### 4.3 Utility Rules (`utils/roadmapRules.js`)

Role:
- Provides deterministic roadmap fallback based on specific missing skills.

Strengths:
- Fast fallback with no external dependency
- Easy to reason about

Limitations:
- Covers only a subset of skills
- Produces static recommendations without user context

### 4.4 Utility Extractor (`utils/extractSkills.js`)

Role:
- Alternate extractor implementation using a short embedded skill list.

Observation:
- Currently not integrated in main server path.
- Represents potential duplicate logic and maintenance overhead.

### 4.5 Frontend Pages

- `upload.html`: Handles form submission and session payload creation.
- `dashboard.html`: Renders KPIs, charts, skill lists, and roadmap interaction.
- `index.html`, `features.html`, `how-it-works.html`: Marketing and explanation pages.

Strengths:
- Clear user flow and polished UI
- Good dashboard readability
- Responsive styles implemented across pages

Limitations:
- Frontend depends on session state only (page refresh/session clear loses data)
- No explicit frontend validation for file size beyond UI copy

## 5. API and Contract Assessment

### `POST /extract-pdf`

Behavior:
- Accepts resume PDF + JD text
- Returns extracted text, skill arrays, match metrics, and roadmap field

Contract risks:
- `roadmap` type may vary (array/string) depending on path
- Lack of structured error codes (only generic message string)

### `POST /generate-roadmap`

Behavior:
- Tries AI generation first
- Falls back to rule-based roadmap

Strengths:
- Good resilience when AI service fails

Risks:
- No timeout/retry policy for external inference call
- No input schema validation

## 6. Security and Compliance Review

### Current Good Practices

- Uses environment variables for API secrets
- Deletes uploaded file after processing

### Risks and Gaps

- No rate limiting on public endpoints
- No explicit file size limit in Multer config
- No MIME/content verification beyond frontend checks
- Potential sensitive resume data appears in logs if expanded debugging is enabled
- No authentication/authorization model

## 7. Performance and Reliability Assessment

### Current State

- Suitable for low traffic and demos
- Single-process Node server
- Synchronous file read (`fs.readFileSync`) in request path can block event loop under load

### Reliability Gaps

- No automated tests
- No health endpoint or readiness checks
- No structured logging strategy
- No centralized error middleware

## 8. Product and UX Assessment

Strengths:
- Intuitive upload-to-dashboard journey
- Visual analytics communicate match quality quickly
- Strong first impression for prototype/demo usage

Improvement opportunities:
- Show confidence scores for extracted skills
- Explain why each missing skill matters per role
- Persist historical analyses and progress tracking
- Add resume rewrite suggestions in structured sections

## 9. Priority Improvement Roadmap

### Phase 1 - Stability and Safety (High Priority)

1. Add backend validation for file type, size, and required fields.
2. Add request timeouts and robust error handling for OCR/AI calls.
3. Standardize `roadmap` response format across all paths.
4. Replace absolute path root handler with portable relative path handling.
5. Add rate limiting and security headers.

### Phase 2 - Quality and Maintainability

1. Add unit tests for skill extraction and comparison logic.
2. Add integration tests for `/extract-pdf` and `/generate-roadmap`.
3. Refactor duplicate extraction logic and unify utility usage.
4. Introduce structured logger and environment-based log levels.

### Phase 3 - Product Differentiation

1. Upgrade from keyword matching to normalized skill ontology.
2. Add role-aware recommendations with industry-specific tracks.
3. Store analysis history for user trend dashboards.
4. Add optional resume section scoring (summary, skills, experience).

## 10. Test Strategy Recommendation

Minimum test suite:
- Unit: `extractSkills`, `compareSkills`, roadmap fallback rules
- Integration: multipart upload route with mocked OCR API
- Integration: roadmap endpoint with mocked HF API response/failure
- Frontend smoke: upload flow, session handoff, dashboard rendering

Suggested tooling:
- Jest or Vitest for unit tests
- Supertest for Express route testing
- Playwright for end-to-end UI smoke checks

## 11. Deployment Readiness Snapshot

Current readiness: Prototype / internal demo

Required before production:
- Security controls (rate limits, validation, headers)
- Test coverage baseline
- Observability (structured logs + health checks)
- Config hardening and secret management process

## 12. Conclusion

AI Career Twin has a strong functional foundation and a clear user value proposition. The application already demonstrates complete end-to-end behavior and compelling visual output. With targeted engineering improvements in validation, consistency, testing, and reliability, it can evolve from prototype to production-capable platform.

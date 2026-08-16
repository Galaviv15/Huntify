# Task 03: Sync Scraped Agency Jobs to MongoDB & Express API Setup

## 🎯 Goal
1. Sync all scraped jobs from the 8 existing agency scrapers into MongoDB with `jobHash` deduplication and tech stack extraction.
2. Build Express REST API endpoints to serve both Jobs and SNC Companies with search & filtering capabilities.

---

## 📁 Required Files
- `scripts/syncAgenciesToDB.js` -> Orchestrates existing agency scrapers and upserts results into MongoDB
- `routes/jobs.js` -> REST API routes for Jobs (filtering by techStack, source, search)
- `routes/companies.js` -> REST API routes for SNC Companies (pagination, search, filtering)
- `routes/applications.js` -> REST API routes for Application Tracking (Kanban CRUD)
- `server.js` -> Express server entry point

---

## 🛠️ Step-by-Step Instructions

### Step 1: Create `scripts/syncAgenciesToDB.js`
- Connect to MongoDB via `config/db.js`.
- Execute existing agency scrapers.
- For each job returned:
  - Run `extractTechStack(title + ' ' + description + ' ' + requirements)`.
  - Calculate `jobHash = SHA256(sourceName + title + sourceUrl)`.
  - Perform `Job.updateOne({ jobHash }, { $set: jobData }, { upsert: true })`.
- Print a summary table of total synced jobs per agency.

---

### Step 2: Create Express Routes
- **`routes/jobs.js`**:
  - `GET /api/jobs`: Supports query params `tech` (comma-separated), `source`, `search` (text index), `page`, `limit`.
- **`routes/companies.js`**:
  - `GET /api/companies`: Returns SNC companies with search and filters (`fundingStage`, `employeeCount`).
- **`routes/applications.js`**:
  - `GET /api/applications`: Populates linked job data.
  - `POST /api/applications`: Adds job to tracker.
  - `PATCH /api/applications/:id`: Updates status (`SAVED`, `APPLIED`, `INTERVIEW`, etc.).
  - `DELETE /api/applications/:id`: Removes from tracker.

---

### Step 3: Setup `server.js`
- Initialize Express app with `cors` and `express.json()`.
- Connect to MongoDB on startup.
- Mount `/api/jobs`, `/api/companies`, and `/api/applications`.
- Start listening on `process.env.PORT || 5000`.

---

## ✅ Definition of Done
1. Run `node scripts/syncAgenciesToDB.js` to populate MongoDB with real jobs.
2. Run `node server.js` and verify API responses via `curl http://localhost:5000/api/jobs` and `curl http://localhost:5000/api/companies`.
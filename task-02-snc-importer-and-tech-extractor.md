# Task 02: Tech Stack Extractor Service & SNC MongoDB Importer

## 🎯 Goal
1. Build an intelligent regex-based `techStackExtractor` service to identify technologies from text.
2. Build an `sncImporter` script to import and upsert companies from `data/companies.json` into MongoDB.
3. Verify with a test execution.

---

## 📁 Required Files
- `services/techStackExtractor.js` -> Tech keyword extraction module
- `scripts/importSncToDB.js` -> Import script to sync `companies.json` into MongoDB
- `scripts/testTechExtractor.js` -> Test script for stack extraction

---

## 🛠️ Step-by-Step Instructions

### Step 1: Create `services/techStackExtractor.js`
Create a robust keyword extractor:
- Maintain a dictionary/regex map of common tech stacks (Languages: Java, Python, C#, C++, Go, Rust, JavaScript, TypeScript, PHP, Ruby; Frameworks: Spring Boot, Node.js, Express, NestJS, React, Angular, Vue, Next.js, Django, FastAPI; Databases: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB; Cloud/DevOps: AWS, GCP, Azure, Docker, Kubernetes, Terraform, CI/CD).
- Use word-boundary checks (`\b`) to prevent false positives (e.g., ensure `Java` does not match `JavaScript`, and `Go` does not match regular English words).
- Export a function `extractTechStack(text)` returning an array of unique detected technologies in standard casing.

---

### Step 2: Create `scripts/testTechExtractor.js`
Create a test script that passes sample job description strings (e.g., `"Seeking a Senior Java & Spring Boot engineer with MySQL, Redis and AWS experience"`) and verifies that the returned array matches the expected tags.

---

### Step 3: Create `scripts/importSncToDB.js`
Create an idempotent importer:
1. Connect to MongoDB using `config/db.js`.
2. Read `data/companies.json` if it exists.
3. For each company, perform an `updateOne` with `{ upsert: true }` based on `slug`:
   - Store name, websiteUrl, linkedinUrl, sncUrl, overview, foundedYear, employeeCount, fundingStage, fundingAmount.
4. Log progress (total processed, inserted/updated count).
5. Disconnect cleanly.

---

## ✅ Definition of Done
1. Run `node scripts/testTechExtractor.js` and ensure all test assertions pass.
2. Run `node scripts/importSncToDB.js` to populate initial companies into MongoDB.
# Task 01: MongoDB Setup & Schemas Definition

## 🎯 Goal
Set up a clean MongoDB connection using Mongoose, define structured schemas for `Company`, `Job`, and `Application`, and verify database connectivity with a test script.

---

## 📁 Required Files
- `config/db.js` -> Database connection management
- `models/Company.js` -> Company Schema (Startup Nation Central & ATS profile)
- `models/Job.js` -> Job Schema (Normalized aggregated jobs)
- `models/Application.js` -> User Application Tracking Schema (Kanban tracker)
- `scripts/testDB.js` -> Integration test script

---

## 🛠️ Step-by-Step Instructions

### Step 1: Create `config/db.js`
Create a reusable connection module using `mongoose`:
- Connect to `process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/huntify_jobs'`.
- Log `🍃 Connected to MongoDB successfully (huntify_jobs DB)` on success.
- Catch errors and exit with code 1 if connection fails.
- Export the `connectDB` async function.

---

### Step 2: Create `models/Company.js`
Create the Mongoose schema for companies with the following fields:
- `slug` (String, required, unique, indexed, trimmed)
- `name` (String, required, trimmed)
- `websiteUrl` (String, default: '')
- `linkedinUrl` (String, default: '')
- `sncUrl` (String, default: '')
- `overview` (String, default: '')
- `foundedYear` (String, default: 'N/A')
- `businessModel` (String, default: 'B2B')
- `employeeCount` (String, default: 'N/A')
- `fundingStage` (String, default: 'N/A')
- `fundingAmount` (String, default: 'N/A')
- `stealthMode` (Boolean, default: false)
- `ats`: Object containing:
  - `provider` (String, enum: ['Comeet', 'Greenhouse', 'Lever', 'Ashby', 'Workable', 'None'], default: 'None')
  - `slug` (String, default: '')
  - `uid` (String, default: '')
  - `careersUrl` (String, default: '')
  - `lastCheckedAt` (Date)
- Enable `timestamps: true`.

---

### Step 3: Create `models/Job.js`
Create the Mongoose schema for normalized job postings:
- `jobHash` (String, required, unique, indexed) -> SHA256 of `companyName + title + sourceUrl` to prevent duplicates.
- `title` (String, required, indexed, trimmed)
- `companyName` (String, required, indexed, trimmed)
- `companyRef` (Mongoose Schema Types ObjectId, ref: 'Company', default: null)
- `sourceType` (String, enum: ['DIRECT_ATS', 'PLACEMENT_AGENCY', 'MANUAL'], default: 'PLACEMENT_AGENCY')
- `sourceName` (String, required, indexed) -> (e.g., 'GotFriends', 'CPS Jobs', 'Comeet')
- `sourceUrl` (String, required, trimmed)
- `location` (String, default: 'Israel')
- `department` (String, default: 'Engineering')
- `experienceLevel` (String, default: 'All')
- `techStack` ([String], indexed) -> Array of detected tech keywords (e.g. ['Java', 'Spring', 'MySQL'])
- `description` (String, default: '')
- `requirements` ([String], default: [])
- `isActive` (Boolean, default: true, indexed: true)
- `publishedAt` (Date, default: Date.now, indexed: true)
- `lastSeenAt` (Date, default: Date.now)
- Enable `timestamps: true`.
- Add a compound Text Index: `{ title: 'text', description: 'text', companyName: 'text' }`.

---

### Step 4: Create `models/Application.js`
Create the Mongoose schema for the Job Application Tracker (Kanban):
- `jobRef` (Mongoose Schema Types ObjectId, ref: 'Job', required: true)
- `status` (String, enum: ['SAVED', 'APPLIED', 'HR_SCREEN', 'TECH_INTERVIEW', 'HOME_ASSIGNMENT', 'OFFER', 'REJECTED'], default: 'SAVED', indexed: true)
- `appliedDate` (Date, default: null)
- `applyMethod` (String, default: 'Website')
- `contactPerson` (String, default: '')
- `salaryExpectation` (String, default: '')
- `notes` (String, default: '')
- `followUpDate` (Date, default: null)
- Enable `timestamps: true`.

---

### Step 5: Create `scripts/testDB.js`
Create a test script that:
1. Connects using `connectDB()`.
2. Cleans up test data with `deleteMany`.
3. Inserts a dummy test company and a dummy test job linked via `companyRef`.
4. Queries the job using `.find({ techStack: 'Java' }).populate('companyRef')`.
5. Logs the populated results to confirm schemas and relations work properly.
6. Closes the connection and exits cleanly with `process.exit(0)`.

---

## ✅ Definition of Done
Run:
```bash
node scripts/testDB.js
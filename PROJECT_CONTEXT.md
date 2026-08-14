# Huntify-Jobs — Automated Tech Job Aggregator & Tracker

## 📌 Project Overview
**Huntify-Jobs** is an end-to-end automated platform designed to aggregate, normalize, and track tech job openings in Israel. 

The system collects jobs directly from company recruitment platforms (ATS - Applicant Tracking Systems) as well as leading tech placement agencies, enriches company profiles with data from Startup Nation Central (SNC), extracts relevant tech stacks, and provides an organized dashboard/tracker for job applications.

---

## 🏗️ Core Architecture & Data Pipeline

```text
[ Data Sources ]
  ├── 1. Placement Agencies (GotFriends, CPS Jobs, Dialog, SeeV, Ethosia, Jobinfo, etc.)
  ├── 2. Direct Company ATS (Greenhouse, Comeet, Lever, Ashby, Workable)
  └── 3. Startup Nation Central (SNC) (Company intelligence, funding, real websites)
       │
       ▼
[ Ingestion & Normalization Layer (Scrapers & Services) ]
  ├── Scraping & Enrichment (cheerio, fetch with auth sessions)
  ├── Tech Stack Extraction (Java, Spring, MySQL, React, AWS, Docker, etc.)
  └── Deduplication Engine (SHA256 hash based on company, title, and URL)
       │
       ▼
[ Persistence Layer (MongoDB via Mongoose) ]
  ├── companies (Company metadata, funding stage, verified ATS profiles)
  ├── jobs (Clean normalized jobs, indexed by techStack, publishedAt, text search)
  └── applications (Kanban-style job tracking: SAVED, APPLIED, INTERVIEWS, OFFERS)
       │
       ▼
[ Application Layer / UI Dashboard ]
  └── Fast filtering, search by tech stack, and interactive application management.
```

## ⚙️ Tech Stack & Coding Standards
Runtime: Node.js (CommonJS: require / module.exports)

Database: MongoDB (Local instance mongodb://127.0.0.1:27017/huntify_jobs / Mongoose ODM)

Scraping & Parsing: Cheerio, native Fetch API, Regex pattern matching

Design Philosophy:

Modular & Single-Responsibility: Scrapers only fetch raw data; Services normalize and extract tags; Models handle persistence.

Idempotency & Deduplication: Re-running a scraper must never create duplicate jobs or companies. Use unique hashes (jobHash) and unique slugs.

Polite Scraping: Include random delays (throttling), proper User-Agent headers, and timeout handling.


## 🎯 Primary Roadmap
Task 01: MongoDB Setup, Schemas & Connection Verification.

Task 02: Tech Stack Extractor Service & SNC Data Importer to MongoDB.

Task 03: Direct ATS Scrapers (Comeet, Greenhouse, Lever, Ashby, Workable).

Task 04: Placement Agencies Scrapers Integration.

Task 05: Job Tracker API & UI Dashboard.


## Project Directory Structure
Huntify-Jobs/
├── config/                  # Configuration & DB connection (db.js)
├── models/                  # Mongoose Schemas (Company.js, Job.js, Application.js)
├── scrapers/                # Web Scrapers & Fetchers
│   ├── agencies/            # 8 Placement agencies scrapers
│   ├── ats/                 # Direct ATS integration scrapers (Comeet, Greenhouse, etc.)
│   └── snc/                 # Startup Nation Central scraper & enrichment (snc_scraper.js)
├── services/                # Business logic, Tech Stack Extractor, Deduplication
├── scripts/                 # Maintenance, test, and task execution scripts
├── data/                    # Temporary JSON storage & backups (ignored in git)
├── .env                     # Environment variables (MONGO_URI, cookies, secrets)
├── PROJECT_CONTEXT.md       # Global project definition & standards (this file)
└── README.md


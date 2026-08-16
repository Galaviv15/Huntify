# Task 04: Modern Frontend Dashboard (React + Vite + Tailwind CSS)

## 🎯 Goal
Build a fully responsive React SPA inside a `./client` directory connected to the Express backend (`http://localhost:5001/api`).

---

## 🏗️ Setup & Architecture
1. Scaffold a React + Vite project in `./client`.
2. Configure Tailwind CSS and Lucide React icons.
3. Setup Axios / Fetch API client targeting `http://localhost:5001/api`.

---

## 📱 Views & Features Specification

### 1. Navigation & Layout
- Top navigation bar with tabs: `Jobs Explorer`, `SNC Companies`, `Application Tracker`.
- Fully responsive: collapases into a smooth slide-over mobile sidebar / drawer on smaller screens.

### 2. Jobs Explorer View
- **View Modes:** Toggle switch between **Cards Grid View** and **Compact Table View**.
- **Search & Filters:**
  - Free text search (Title, Description).
  - Tech Stack multi-select filter tags.
  - Source Agency dropdown filter.
- **Job Card / Row Actions:**
  - Displays: Title, Agency/Source, Tech Badges, Date, Location, Direct Source Link.
  - "Apply / Track Job" button -> triggers `POST /api/applications` with default status `APPLIED` or `SAVED`.

### 3. SNC Companies Directory View
- Searchable & filterable table of companies.
- Columns: Company Name, Category/Sector, Employees Range, Funding Stage, Total Raised, Direct Links (SNC, Website, LinkedIn).
- Filters for funding stage and company size.

### 4. Applications Tracker View (Interactive Rows Table)
- Editable spreadsheet-style table displaying tracked applications.
- Columns & Inline editable fields:
  - Job Title & Source / Company
  - Status Dropdown (`SAVED`, `APPLIED`, `HR_SCREEN`, `TECH_INTERVIEW`, `HOME_ASSIGNMENT`, `OFFER`, `REJECTED`)
  - Contact Person (Recruiter name / email)
  - Salary Expectation (editable input)
  - Notes (textarea / editable field)
  - Direct Job Link
  - Action: Delete / Update (`PATCH` & `DELETE` endpoints)

---

## ✅ Definition of Done
1. React frontend runs cleanly (`npm run dev` inside `client`).
2. Fetches real data from `http://localhost:5001/api/jobs` and `http://localhost:5001/api/companies`.
3. Adding, modifying status/notes/salary, and removing applications updates MongoDB in real time.
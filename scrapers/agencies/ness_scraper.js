const { chromium } = require('playwright');
const crypto = require('crypto');

/**
 * Generates a unique SHA-256 hash based on normalized company name, job title, and clean URL.
 */
function generateJobHash(companyName, jobTitle, rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`.toLowerCase().trim();
    const normalizedCompany = companyName.toLowerCase().trim();
    const normalizedTitle = jobTitle.toLowerCase().trim();

    const combinedString = `${normalizedCompany}|${normalizedTitle}|${cleanUrl}`;
    return crypto.createHash('sha256').update(combinedString).digest('hex');
  } catch (e) {
    const combinedString = `${companyName}|${jobTitle}|${rawUrl}`.toLowerCase().trim();
    return crypto.createHash('sha256').update(combinedString).digest('hex');
  }
}

/**
 * Recommends the most suitable CV based on keywords in the job title/description.
 */
function recommendCV(jobTitle, description = '') {
  const text = `${jobTitle} ${description}`.toLowerCase();

  if (text.includes('fullstack') || text.includes('full stack') || text.includes('full-stack')) {
    return 'CV_Fullstack.pdf';
  } else if (text.includes('backend') || text.includes('java') || text.includes('spring') || text.includes('node') || text.includes('python') || text.includes('c#')) {
    return 'CV_Backend.pdf';
  } else if (text.includes('frontend') || text.includes('react') || text.includes('angular') || text.includes('vue')) {
    return 'CV_Frontend.pdf';
  }
  return 'CV_General.pdf';
}

/**
 * Scrapes direct job listings from Ness Technologies via their internal API response.
 */
async function scrapeNessJobs() {
  const targetUrl = 'https://www.ness-tech.co.il/careers/';
  const apiUrl = 'https://www.ness-tech.co.il/careers/api/Careers/GetAllItems';

  console.log(`🔎 Executing browser API extraction for Ness Technologies...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    // 1. Visit main careers page to establish browser session and cookies
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Fetch the JSON directly inside page context using established session
    const payload = await page.evaluate(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
            'referer': 'https://www.ness-tech.co.il/careers/'
          }
        });

        if (!response.ok) return null;
        return await response.json();
      } catch (e) {
        return null;
      }
    }, apiUrl);

    // Extract jobs array specifically from 'allOrderDetailsList'
    const items = payload && Array.isArray(payload.allOrderDetailsList)
      ? payload.allOrderDetailsList
      : [];

    console.log(`✅ Extracted ${items.length} raw jobs from allOrderDetailsList!`);

    const scrapedJobs = [];
    const seenHashes = new Set();

    for (const item of items.slice(0, 15)) {
      const jobId = item.index;
      const title = item.title;

      if (!jobId || !title) continue;

      const directUrl = `https://www.ness-tech.co.il/careers/job/${jobId}`;
      const company = 'Ness Technologies';
      const jobHash = generateJobHash(company, title, directUrl);

      if (!seenHashes.has(jobHash)) {
        seenHashes.add(jobHash);
        const description = item.posDescription || '';
        const recommendedCv = recommendCV(title, description);

        const category = item.profName 
          ? (item.subProfName ? `${item.profName} - ${item.subProfName}` : item.profName)
          : 'תוכנה / IT';

        scrapedJobs.push({
          title: String(title).trim(),
          company,
          category,
          location: item.posLocation || 'ישראל / היברידי',
          url: directUrl,
          recommendedCv,
          jobHash,
          source: 'Ness'
        });
      }
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('❌ Error during Ness scraping:', err.message);
    await browser.close();
    return [];
  }
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeNessJobs();
    console.log(`\n✅ Successfully processed ${jobs.length} direct jobs from Ness Technologies:\n`);

    jobs.forEach((job, index) => {
      console.log(`--- Job #${index + 1} ---`);
      console.log(`📌 Title: ${job.title}`);
      console.log(`📂 Category: ${job.category}`);
      console.log(`🏢 Company: ${job.company}`);
      console.log(`📍 Location: ${job.location}`);
      console.log(`🔗 Direct Link: ${job.url}`);
      console.log(`🎯 Recommended CV: ${job.recommendedCv}`);
      console.log(`🔑 Hash: ${job.jobHash}\n`);
    });
  } catch (error) {
    console.error('❌ Execution error:', error);
  }
})();

module.exports = { scrapeNessJobs };
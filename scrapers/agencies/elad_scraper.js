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
  } else if (text.includes('data') || text.includes('sql') || text.includes('bi') || text.includes('python')) {
    return 'CV_Data.pdf';
  } else if (text.includes('crm') || text.includes('salesforce') || text.includes('dynamics')) {
    return 'CV_CRM.pdf';
  }
  return 'CV_General.pdf';
}

/**
 * Scrapes job listings from Elad Systems using exact JetEngine listing selectors.
 */
async function scrapeEladJobs() {
  const categories = [
    { name: 'Digital', url: 'https://careers.eladsoft.com/%D7%9B%D7%9C-%D7%94%D7%9E%D7%A9%D7%A8%D7%95%D7%AA-digital/' },
    { name: 'Data', url: 'https://careers.eladsoft.com/%D7%9B%D7%9C-%D7%94%D7%9E%D7%A9%D7%A8%D7%95%D7%AA-data' },
    { name: 'CRM', url: 'https://careers.eladsoft.com/%D7%9B%D7%9C-%D7%94%D7%9E%D7%A9%D7%A8%D7%95%D7%AA-crm/' }
  ];

  console.log(`🔎 Extracting Elad Systems jobs via JetEngine selectors...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const allScrapedJobs = [];
  const seenHashes = new Set();

  for (const cat of categories) {
    console.log(`  📂 Scanning category: ${cat.name}...`);

    try {
      await page.goto(cat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);

      // Scroll down to ensure JetEngine AJAX grid renders
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);

      const categoryJobs = await page.evaluate((categoryName) => {
        const results = [];
        const seenUrls = new Set();

        // Query JetEngine listing items exact class from DOM inspector
        const items = Array.from(document.querySelectorAll('.jet-listing-grid__item, [class*="jet-listing-grid__item"]'));

        for (const item of items) {
          // Find anchor tag inside heading or anywhere in the listing card
          const anchor = item.querySelector('.elementor-heading-title a, a[href*="/jobs/"], a[href*="/jobs/"]') || item.querySelector('a');
          if (!anchor) continue;

          const url = anchor.href;
          const title = anchor.innerText ? anchor.innerText.trim() : '';

          if (!url || !title || title.length < 2 || seenUrls.has(url)) continue;

          seenUrls.add(url);

          const fullText = item.innerText ? item.innerText.trim() : '';
          const locationMatch = fullText.match(/(מרכז|צפון|דרום|שרון|שפלה|ירושלים|תל אביב|הרצליה|רמת גן|פתח תקווה|היברידי)/i);
          const location = locationMatch ? locationMatch[0] : 'ישראל / היברידי';

          results.push({
            title,
            url,
            category: categoryName,
            location,
            description: fullText
          });
        }

        // Fallback: If listing-grid item not found directly, query all anchors pointing to /jobs/
        if (results.length === 0) {
          const links = Array.from(document.querySelectorAll('a[href*="/jobs/"]'));
          for (const a of links) {
            const url = a.href;
            const title = a.innerText ? a.innerText.trim() : '';

            if (url && title && title.length > 2 && !seenUrls.has(url)) {
              seenUrls.add(url);
              results.push({
                title,
                url,
                category: categoryName,
                location: 'ישראל / היברידי',
                description: ''
              });
            }
          }
        }

        return results;
      }, cat.name);

      for (const job of categoryJobs) {
        const company = 'Elad Systems';
        const jobHash = generateJobHash(company, job.title, job.url);

        if (!seenHashes.has(jobHash)) {
          seenHashes.add(jobHash);
          const recommendedCv = recommendCV(job.title, job.description);

          allScrapedJobs.push({
            title: job.title,
            company,
            category: `Elad ${job.category}`,
            location: job.location,
            url: job.url,
            recommendedCv,
            jobHash,
            source: 'Elad'
          });
        }
      }

    } catch (e) {
      console.error(`  ⚠️ Error scanning category ${cat.name}:`, e.message);
    }
  }

  await browser.close();
  return allScrapedJobs;
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeEladJobs();
    console.log(`\n✅ Successfully extracted ${jobs.length} jobs from Elad Systems:\n`);

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

module.exports = { scrapeEladJobs };
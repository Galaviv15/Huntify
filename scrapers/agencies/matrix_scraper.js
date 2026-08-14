const { chromium } = require('playwright');
const crypto = require('crypto');

/**
 * Generates a unique SHA-256 hash based on normalized company name, job title, and clean URL.
 */
function generateJobHash(companyName, jobTitle, rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`.toLowerCase().trim();
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
  } else if (text.includes('backend') || text.includes('java') || text.includes('spring') || text.includes('node') || text.includes('c#') || text.includes('.net')) {
    return 'CV_Backend.pdf';
  } else if (text.includes('frontend') || text.includes('react') || text.includes('angular') || text.includes('vue')) {
    return 'CV_Frontend.pdf';
  }
  return 'CV_General.pdf';
}

/**
 * Scrapes direct job cards from Matrix by inspecting card elements.
 */
async function scrapeMatrixJobs() {
  console.log('🔎 Starting Matrix direct-card job scraping...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const url = 'https://www.matrix.co.il/jobs/';

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Extract jobs directly by isolating job card blocks
    const extractedJobs = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // Find job card wrappers or container elements
      const cards = Array.from(document.querySelectorAll('.job-item, .card, [class*="job"], article'));

      for (const card of cards) {
        // Look for title element inside card
        const titleElem = card.querySelector('h2, h3, h4, [class*="title"]');
        // Look for direct link element inside card
        const linkElem = card.querySelector('a[href*="job"], a[href*="position"], a[href*="/jobs/"]');

        if (titleElem && linkElem) {
          const title = titleElem.innerText.trim();
          const href = linkElem.href;

          // Ensure it's not a generic category or navigation link
          if (
            title.length > 3 &&
            href &&
            !href.endsWith('/jobs/') &&
            !href.endsWith('/jobs') &&
            !seen.has(href)
          ) {
            seen.add(href);
            results.push({
              title: title.replace(/\n/g, ' '),
              url: href
            });
          }
        }
      }

      // Fallback: If no structured cards found, extract links containing specific position patterns
      if (results.length === 0) {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        for (const a of anchors) {
          const href = a.href;
          const text = a.innerText.trim();

          // Check if link points to a specific job detail page
          if (href.includes('/jobs/') && text.length > 4 && !text.includes('לכל') && !seen.has(href)) {
            const parts = new URL(href).pathname.split('/').filter(Boolean);
            // Must have specific subpath depth for individual position
            if (parts.length >= 2 && parts[parts.length - 1] !== 'jobs') {
              seen.add(href);
              results.push({
                title: text.replace(/\n/g, ' '),
                url: href
              });
            }
          }
        }
      }

      return results;
    });

    const scrapedJobs = [];

    for (const job of extractedJobs.slice(0, 10)) {
      const company = 'Matrix';
      let decodedUrl = job.url;
      try {
        decodedUrl = decodeURIComponent(job.url);
      } catch (e) {}

      const jobHash = generateJobHash(company, job.title, decodedUrl);
      const recommendedCv = recommendCV(job.title);

      scrapedJobs.push({
        title: job.title,
        company,
        location: 'ישראל / היברידי',
        url: decodedUrl,
        recommendedCv,
        jobHash,
        source: 'Matrix'
      });
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('Error during Matrix scraping execution:', err.message);
    await browser.close();
    return [];
  }
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeMatrixJobs();
    console.log(`\n✅ Successfully scraped ${jobs.length} direct job listings from Matrix:\n`);

    jobs.forEach((job, index) => {
      console.log(`--- Job #${index + 1} ---`);
      console.log(`📌 Title: ${job.title}`);
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

module.exports = { scrapeMatrixJobs };
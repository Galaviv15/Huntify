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
  } else if (text.includes('backend') || text.includes('java') || text.includes('spring') || text.includes('node') || text.includes('sap')) {
    return 'CV_Backend.pdf';
  } else if (text.includes('frontend') || text.includes('react') || text.includes('angular') || text.includes('vue')) {
    return 'CV_Frontend.pdf';
  }
  return 'CV_General.pdf';
}

/**
 * Scrapes specific job listings from SQLink using path depth analysis.
 */
async function scrapeSQLinkJobs() {
  console.log('🔎 Starting SQLink job scraping process...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const url = 'https://www.sqlink.com/career/%D7%A4%D7%99%D7%AA%D7%95%D7%97-%D7%AA%D7%95%D7%9B%D7%A0%D7%94-webmobile/';

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Scroll down to trigger potential lazy loading
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(2000);

    // Extract all links directly from the DOM
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        text: a.innerText.trim()
      }));
    });

    const scrapedJobs = [];
    const seenUrls = new Set();

    for (const item of allLinks) {
      if (!item.href || !item.href.includes('/career/')) continue;

      try {
        const decodedUrl = decodeURIComponent(item.href);
        const parsed = new URL(decodedUrl);
        // Split path segments by slash
        const pathSegments = parsed.pathname.split('/').filter(Boolean);

        // Specific jobs in SQLink sit at path depth 4 or higher:
        // e.g., [career, פיתוח-תוכנה-webmobile, פיתוח-crm, מפתחת-sap-s4hana]
        if (pathSegments.length >= 4 && !seenUrls.has(decodedUrl)) {
          seenUrls.add(decodedUrl);

          // Extract title from text or fallback to URL slug
          let rawTitle = item.text.length > 2 ? item.text : pathSegments[pathSegments.length - 1];
          // Clean hyphens and line breaks
          const cleanTitle = rawTitle.replace(/-/g, ' ').replace(/\n/g, ' ').trim();

          const company = 'SQLink';
          const jobHash = generateJobHash(company, cleanTitle, decodedUrl);
          const recommendedCv = recommendCV(cleanTitle);

          scrapedJobs.push({
            title: cleanTitle,
            company,
            location: 'מרכז / היברידי',
            url: decodedUrl,
            recommendedCv,
            jobHash,
          });

          if (scrapedJobs.length >= 10) break;
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('Error during scraping execution:', err.message);
    await browser.close();
    return [];
  }
}

(async () => {
  try {
    const jobs = await scrapeSQLinkJobs();
    console.log(`\n✅ Successfully scraped ${jobs.length} jobs from SQLink:\n`);

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

module.exports = { scrapeSQLinkJobs };
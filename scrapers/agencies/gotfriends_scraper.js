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
  } else if (text.includes('backend') || text.includes('java') || text.includes('spring') || text.includes('node') || text.includes('python') || text.includes('c#')) {
    return 'CV_Backend.pdf';
  } else if (text.includes('frontend') || text.includes('react') || text.includes('angular') || text.includes('vue')) {
    return 'CV_Frontend.pdf';
  }
  return 'CV_General.pdf';
}

/**
 * Scrapes job listings directly from GotFriends.
 */
async function scrapeGotFriendsJobs() {
  console.log('🔎 Starting GotFriends direct job scraping process...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const url = 'https://www.gotfriends.co.il/jobs/';

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the job list elements to be visible
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollBy(0, 800));

    const extractedJobs = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // Query all links across the page
      const anchors = Array.from(document.querySelectorAll('a[href]'));

      for (const a of anchors) {
        const href = a.href;
        const text = a.innerText.trim();

        if (!href || seen.has(href)) continue;

        let decoded = href;
        try {
          decoded = decodeURIComponent(href);
        } catch (e) {}

        // GotFriends position URLs usually contain specific identifiers, job numbers, or subpaths
        const isJobUrl = decoded.includes('/job/') || decoded.includes('/jobs/') || /\d+/.test(decoded);
        const isNotNavigation = !decoded.endsWith('/jobs/') && !decoded.endsWith('/jobs') && !text.includes('כל המשרות');

        if (isJobUrl && isNotNavigation && text.length > 3) {
          seen.add(href);
          results.push({
            title: text.replace(/\n/g, ' ').trim(),
            url: decoded
          });
        }
      }

      // Fallback: search within job card elements directly
      if (results.length === 0) {
        const cards = Array.from(document.querySelectorAll('.job-item, .job-card, [class*="job"]'));
        for (const card of cards) {
          const titleElem = card.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
          const linkElem = card.querySelector('a[href]');

          if (titleElem && linkElem) {
            const titleText = titleElem.innerText.trim();
            const href = linkElem.href;

            if (titleText.length > 2 && href && !seen.has(href)) {
              seen.add(href);
              results.push({
                title: titleText.replace(/\n/g, ' ').trim(),
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
      const company = 'GotFriends';
      const jobHash = generateJobHash(company, job.title, job.url);
      const recommendedCv = recommendCV(job.title);

      scrapedJobs.push({
        title: job.title,
        company,
        location: 'מרכז / היברידי',
        url: job.url,
        recommendedCv,
        jobHash,
        source: 'GotFriends'
      });
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('Error during GotFriends scraping execution:', err.message);
    await browser.close();
    return [];
  }
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeGotFriendsJobs();
    console.log(`\n✅ Successfully scraped ${jobs.length} direct jobs from GotFriends:\n`);

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

module.exports = { scrapeGotFriendsJobs };
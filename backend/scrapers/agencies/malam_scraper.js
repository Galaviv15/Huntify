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
 * Scrapes job listings from Malam Team using DOM selectors from ul_career.
 */
async function scrapeMalamJobs() {
  const targetUrl = 'https://www.malamteam.com/%d7%9c%d7%95%d7%91%d7%99-%d7%97%d7%99%d7%a4%d7%95%d7%a9-%d7%a7%d7%a8%d7%99%d7%99%d7%a8%d7%94/';
  console.log(`🔎 Extracting Malam Team jobs from DOM ul_career...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Scroll to render all list items
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(1500);

    const scrapedRaw = await page.evaluate(() => {
      const results = [];
      const seenUrls = new Set();

      // Query the specific ul_career list items shown in the DOM inspector
      const listItems = Array.from(document.querySelectorAll('ul.ul_career > li, li.s_career'));

      for (const li of listItems) {
        // Extract title from h2
        const h2 = li.querySelector('h2');
        const titleText = h2 ? h2.innerText.trim() : '';

        // Extract direct job link
        const anchor = li.querySelector('a[href*="/משרה/"]') || li.querySelector('a[href*="java"]') || li.querySelector('a');
        const url = anchor ? anchor.href : '';

        // Extract details from paragraph or secondary rows
        const paragraph = li.querySelector('p');
        const descText = paragraph ? paragraph.innerText.trim() : '';

        if (titleText && url && !seenUrls.has(url)) {
          seenUrls.add(url);

          const locationMatch = descText.match(/(מרכז|צפון|דרום|שרון|שפלה|ירושלים|תל אביב|היברידי)/i);
          const location = locationMatch ? locationMatch[0] : 'ישראל / היברידי';

          results.push({
            title: titleText,
            url,
            description: descText,
            location
          });
        }
      }

      return results;
    });

    const scrapedJobs = [];
    const seenHashes = new Set();

    for (const job of scrapedRaw.slice(0, 15)) {
      const company = 'Malam Team';
      const jobHash = generateJobHash(company, job.title, job.url);

      if (!seenHashes.has(jobHash)) {
        seenHashes.add(jobHash);
        const recommendedCv = recommendCV(job.title, job.description);

        scrapedJobs.push({
          title: job.title,
          company,
          category: 'תוכנה / IT',
          location: job.location,
          url: job.url,
          recommendedCv,
          jobHash,
          source: 'Malam'
        });
      }
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('❌ Error during Malam Team scraping:', err.message);
    await browser.close();
    return [];
  }
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeMalamJobs();
    console.log(`\n✅ Successfully extracted ${jobs.length} jobs from Malam Team:\n`);

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

module.exports = { scrapeMalamJobs };
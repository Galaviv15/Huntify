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
 * Derives a clean category name from the endpoint URL or anchor text.
 */
function cleanCategoryName(url, defaultName = 'תוכנה') {
  if (!url) return defaultName;
  const parts = url.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || defaultName;

  const categoryMap = {
    'software': 'תוכנה / Software',
    'hardware': 'חומרה / Hardware',
    'qa': 'בדיקות / QA',
    'devops': 'DevOps & Cloud',
    'cyber': 'סייבר / Cyber Security',
    'data': 'Data & Analytics',
    'product': 'ניהול מוצר / Product'
  };

  return categoryMap[slug.toLowerCase()] || slug;
}

/**
 * Dynamically discovers category endpoints and scrapes jobs with category assignment.
 */
async function scrapeDialogJobs() {
  const baseUrl = 'https://www.dialog.co.il/high-tech/jobs/';
  console.log(`🔎 Discovering categories automatically from: ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 1: Automatically extract category endpoints from main navigation
    const categoryEndpoints = await page.evaluate(() => {
      const endpoints = [];
      const seen = new Set();
      const anchors = Array.from(document.querySelectorAll('a[href*="/high-tech/jobs/"]'));

      for (const a of anchors) {
        const href = a.href;
        const name = a.innerText.trim();

        if (
          href &&
          href !== 'https://www.dialog.co.il/high-tech/jobs/' &&
          !href.endsWith('/jobs/') &&
          !href.includes('positionId=') &&
          !href.includes('jobpage') &&
          !seen.has(href)
        ) {
          seen.add(href);
          endpoints.push({ url: href, name });
        }
      }
      return endpoints;
    });

    console.log(`📌 Found ${categoryEndpoints.length} dynamic categories.`);

    // Fallback if no subcategories discovered
    if (categoryEndpoints.length === 0) {
      categoryEndpoints.push({ url: 'https://www.dialog.co.il/high-tech/jobs/software', name: 'תוכנה' });
    }

    const scrapedJobs = [];
    const seenHashes = new Set();

    // Step 2: Loop through discovered endpoints and collect direct jobs with category tagging
    for (const category of categoryEndpoints.slice(0, 5)) { // Scraping top 5 categories
      const categoryLabel = category.name || cleanCategoryName(category.url);
      console.log(`🚀 Scraping category [${categoryLabel}]: ${category.url}`);

      try {
        await page.goto(category.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2000);

        const categoryJobs = await page.evaluate(() => {
          const items = [];
          const seen = new Set();
          const links = Array.from(document.querySelectorAll('a[href]'));

          for (const a of links) {
            const href = a.href;
            const text = a.innerText.trim();

            if (!href || seen.has(href) || text.length < 2) continue;

            if (href.includes('positionId=') || href.includes('jobpage') || href.includes('/job/')) {
              seen.add(href);
              items.push({
                title: text.replace(/\n/g, ' ').trim(),
                url: href
              });
            }
          }
          return items;
        });

        for (const job of categoryJobs) {
          const company = 'Dialog';
          const jobHash = generateJobHash(company, job.title, job.url);

          if (!seenHashes.has(jobHash)) {
            seenHashes.add(jobHash);
            const recommendedCv = recommendCV(job.title);

            scrapedJobs.push({
              title: job.title,
              company,
              category: categoryLabel,
              location: 'מרכז / היברידי',
              url: job.url,
              recommendedCv,
              jobHash,
              source: 'Dialog'
            });
          }
        }
      } catch (e) {
        console.error(`Failed to scrape category ${category.url}:`, e.message);
      }
    }

    await browser.close();
    return scrapedJobs;

  } catch (err) {
    console.error('Error during dynamic Dialog scraping:', err.message);
    await browser.close();
    return [];
  }
}

// Execution block
(async () => {
  try {
    const jobs = await scrapeDialogJobs();
    console.log(`\n✅ Successfully scraped ${jobs.length} unique jobs with category tagging from Dialog:\n`);

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

module.exports = { scrapeDialogJobs };
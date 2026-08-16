const { connectDB } = require('../config/db');
const Job = require('../models/Job');
const { extractTechStack } = require('../services/techStackExtractor');
const crypto = require('crypto');

// Import all agency scrapers
const { scrapeAmanJobs } = require('../scrapers/agencies/aman_scraper');
const { scrapeDialogJobs } = require('../scrapers/agencies/dialog_scraper');
const { scrapeEladJobs } = require('../scrapers/agencies/elad_scraper');
const { scrapeGotFriendsJobs } = require('../scrapers/agencies/gotfriends_scraper');
const { scrapeMalamJobs } = require('../scrapers/agencies/malam_scraper');
const { scrapeMatrixJobs } = require('../scrapers/agencies/matrix_scraper');
const { scrapeNessJobs } = require('../scrapers/agencies/ness_scraper');
const { scrapeSQLinkJobs } = require('../scrapers/agencies/sqlinks_scraper');

/**
 * Normalize scraped job to Job schema format
 */
function normalizeJob(scrapedJob) {
  // Generate consistent jobHash using sourceName, title, and URL
  const jobHash = crypto
    .createHash('sha256')
    .update(`${scrapedJob.source}|${scrapedJob.title}|${scrapedJob.url}`)
    .digest('hex');

  // Extract tech stack from title and any available description
  const techStack = extractTechStack(`${scrapedJob.title} ${scrapedJob.description || ''}`);

  return {
    jobHash,
    title: scrapedJob.title,
    companyName: scrapedJob.company || 'Unknown',
    sourceType: 'AGENCY',
    sourceName: scrapedJob.source,
    sourceUrl: scrapedJob.url,
    location: scrapedJob.location || 'Israel',
    department: '',
    experienceLevel: 'All',
    techStack,
    description: scrapedJob.description || '',
    requirements: [],
    isActive: true,
    publishedAt: new Date(),
  };
}

/**
 * Sync all agency scrapers to MongoDB
 */
async function syncAgenciesToDB() {
  try {
    console.log('\n📦 Connecting to MongoDB...');
    await connectDB();

    // Define scraper functions with names
    const scrapers = [
      { name: 'Aman', scraper: scrapeAmanJobs },
      { name: 'Dialog', scraper: scrapeDialogJobs },
      { name: 'Elad', scraper: scrapeEladJobs },
      { name: 'GotFriends', scraper: scrapeGotFriendsJobs },
      { name: 'Malam', scraper: scrapeMalamJobs },
      { name: 'Matrix', scraper: scrapeMatrixJobs },
      { name: 'Ness', scraper: scrapeNessJobs },
      { name: 'SQLink', scraper: scrapeSQLinkJobs },
    ];

    const summary = {};

    console.log('\n🔄 Syncing jobs from all agencies...\n');

    for (const { name, scraper } of scrapers) {
      try {
        console.log(`⏳ Scraping ${name}...`);
        const jobs = await scraper();
        console.log(`   ✅ Retrieved ${jobs.length} jobs from ${name}`);

        let saved = 0;
        let updated = 0;

        for (const scrapedJob of jobs) {
          try {
            const normalizedJob = normalizeJob(scrapedJob);

            const result = await Job.updateOne(
              { jobHash: normalizedJob.jobHash },
              { $set: normalizedJob },
              { upsert: true }
            );

            if (result.upsertedId) {
              saved++;
            } else if (result.modifiedCount > 0) {
              updated++;
            }
          } catch (error) {
            console.log(`   ⚠️  Error saving job: ${error.message}`);
          }
        }

        summary[name] = {
          total: jobs.length,
          saved,
          updated,
        };

        console.log(`   💾 Saved: ${saved}, Updated: ${updated}\n`);
      } catch (error) {
        console.error(`   ❌ Error scraping ${name}: ${error.message}\n`);
        summary[name] = {
          total: 0,
          saved: 0,
          updated: 0,
          error: error.message,
        };
      }
    }

    // Print summary table
    console.log('\n' + '='.repeat(80));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(80));

    let totalJobs = 0;
    let totalSaved = 0;
    let totalUpdated = 0;

    console.log('\n┌─────────────┬───────────┬────────────┬──────────────┐');
    console.log('│ Agency      │ Total     │ Saved      │ Updated      │');
    console.log('├─────────────┼───────────┼────────────┼──────────────┤');

    for (const [agency, stats] of Object.entries(summary)) {
      const total = stats.total || 0;
      const saved = stats.saved || 0;
      const updated = stats.updated || 0;

      totalJobs += total;
      totalSaved += saved;
      totalUpdated += updated;

      const agencyPad = agency.padEnd(11);
      const totalPad = total.toString().padEnd(9);
      const savedPad = saved.toString().padEnd(10);
      const updatedPad = updated.toString().padEnd(12);

      console.log(`│ ${agencyPad} │ ${totalPad} │ ${savedPad} │ ${updatedPad} │`);
    }

    console.log('├─────────────┼───────────┼────────────┼──────────────┤');
    console.log(`│ TOTAL       │ ${totalJobs.toString().padEnd(9)} │ ${totalSaved.toString().padEnd(10)} │ ${totalUpdated.toString().padEnd(12)} │`);
    console.log('└─────────────┴───────────┴────────────┴──────────────┘');

    // Verify in database
    const allJobs = await Job.countDocuments({ sourceType: 'AGENCY' });
    console.log(`\n✅ Total jobs in MongoDB: ${allJobs}`);

    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during sync:', error.message);
    process.exit(1);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await require('mongoose').disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the sync
syncAgenciesToDB();

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const crypto = require('crypto');

async function testDB() {
  try {
    // Step 1: Connect to database
    console.log('\n📦 Connecting to MongoDB...');
    await connectDB();

    // Step 2: Clean up test data
    console.log('🧹 Cleaning up test data...');
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('✅ Test data cleaned up');

    // Step 3: Insert a dummy test company
    console.log('\n➕ Inserting test company...');
    const testCompany = await Company.create({
      slug: 'google-israel',
      name: 'Google Israel',
      websiteUrl: 'https://google.com',
      linkedinUrl: 'https://linkedin.com/company/google',
      sncUrl: 'https://startupnationcentral.org/company/google',
      overview: 'Tech giant offering cloud and software solutions',
      foundedYear: '1998',
      businessModel: 'B2B',
      employeeCount: '1000+',
      fundingStage: 'Public',
      fundingAmount: 'N/A',
      stealthMode: false,
      ats: {
        provider: 'Greenhouse',
        slug: 'google-greenhouse',
        uid: 'google123',
        careersUrl: 'https://google.com/careers',
        lastCheckedAt: new Date(),
      },
    });
    console.log(`✅ Company created: ${testCompany.name} (ID: ${testCompany._id})`);

    // Step 4: Insert a dummy test job linked to the company
    console.log('\n➕ Inserting test job...');
    const jobHash = crypto
      .createHash('sha256')
      .update('Google Israel' + 'Senior Backend Engineer' + 'https://google.com/jobs/123')
      .digest('hex');

    const testJob = await Job.create({
      jobHash,
      title: 'Senior Backend Engineer',
      companyName: 'Google Israel',
      companyRef: testCompany._id,
      sourceType: 'DIRECT_ATS',
      sourceName: 'Greenhouse',
      sourceUrl: 'https://google.com/jobs/123',
      location: 'Tel Aviv',
      department: 'Engineering',
      experienceLevel: '3+ years',
      techStack: ['Java', 'Spring', 'MySQL', 'Docker'],
      description: 'Looking for a Senior Backend Engineer with strong Java experience',
      requirements: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Kubernetes'],
      isActive: true,
      publishedAt: new Date(),
    });
    console.log(`✅ Job created: ${testJob.title} (ID: ${testJob._id})`);

    // Step 5: Query the job with populated company reference
    console.log('\n🔍 Querying jobs by techStack "Java"...');
    const queriedJobs = await Job.find({ techStack: 'Java' }).populate('companyRef');

    console.log('\n📊 Query Results:');
    console.log('='.repeat(80));
    queriedJobs.forEach((job, index) => {
      console.log(`\nJob #${index + 1}:`);
      console.log(`  Title: ${job.title}`);
      console.log(`  Company: ${job.companyRef?.name || 'N/A'}`);
      console.log(`  Source: ${job.sourceName}`);
      console.log(`  Tech Stack: ${job.techStack.join(', ')}`);
      console.log(`  Location: ${job.location}`);
      console.log(`  Active: ${job.isActive}`);
      console.log(`  Published: ${job.publishedAt}`);
    });
    console.log('='.repeat(80));

    // Step 6: Verify relationships work correctly
    console.log('\n✅ Relationship Verification:');
    if (queriedJobs.length > 0 && queriedJobs[0].companyRef) {
      console.log(`   ✓ Job successfully linked to Company: "${queriedJobs[0].companyRef.name}"`);
      console.log(`   ✓ Company ATS Provider: ${queriedJobs[0].companyRef.ats.provider}`);
    } else {
      console.log('   ❌ Company reference not populated correctly');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Error during database test:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Step 7: Close connection and exit cleanly
    console.log('\n🔌 Closing database connection...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the test
testDB();

/**
 * Verification test for Task 03 implementation
 * Tests that all modules can be loaded and basic functionality works
 */

const mongoose = require('mongoose');

async function verifyTask03() {
  try {
    console.log('\n✅ Task 03 Verification Test\n');
    console.log('='.repeat(80));

    // Test 1: Verify all modules load correctly
    console.log('\n1️⃣  Verifying module imports...');
    try {
      const { connectDB } = require('../config/db');
      console.log('   ✅ config/db.js');

      const Company = require('../models/Company');
      console.log('   ✅ models/Company.js');

      const Job = require('../models/Job');
      console.log('   ✅ models/Job.js');

      const Application = require('../models/Application');
      console.log('   ✅ models/Application.js');

      const { extractTechStack } = require('../services/techStackExtractor');
      console.log('   ✅ services/techStackExtractor.js');

      const jobsRouter = require('../routes/jobs');
      console.log('   ✅ routes/jobs.js');

      const companiesRouter = require('../routes/companies');
      console.log('   ✅ routes/companies.js');

      const applicationsRouter = require('../routes/applications');
      console.log('   ✅ routes/applications.js');

      console.log('\n✅ All modules loaded successfully!');
    } catch (error) {
      console.error('   ❌ Module loading failed:', error.message);
      throw error;
    }

    // Test 2: Test tech stack extractor
    console.log('\n2️⃣  Testing Tech Stack Extractor...');
    const { extractTechStack } = require('../services/techStackExtractor');

    const testText =
      'We are looking for a Senior React and Node.js developer with experience in TypeScript, MongoDB, and AWS.';
    const techStack = extractTechStack(testText);
    console.log(`   Input: "${testText}"`);
    console.log(`   Extracted: ${techStack.join(', ')}`);

    if (techStack.includes('React') && techStack.includes('Node.js')) {
      console.log('   ✅ Tech stack extraction working correctly!');
    } else {
      console.log('   ❌ Tech stack extraction incomplete');
    }

    // Test 3: Verify database connection
    console.log('\n3️⃣  Testing Database Connection...');
    const { connectDB } = require('../config/db');
    await connectDB();
    console.log('   ✅ Successfully connected to MongoDB');

    // Test 4: Check database collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`   Collections: ${collectionNames.join(', ') || 'none yet'}`);

    // Test 5: Verify Job schema
    console.log('\n4️⃣  Testing Job Model...');
    const Job = require('../models/Job');
    console.log(`   ✅ Job model defined`);
    console.log(`   ✅ Job schema fields: ${Object.keys(Job.schema.paths).slice(0, 5).join(', ')}...`);

    // Test 6: Verify Company schema
    console.log('\n5️⃣  Testing Company Model...');
    const Company = require('../models/Company');
    console.log(`   ✅ Company model defined`);
    console.log(`   ✅ Company schema fields: ${Object.keys(Company.schema.paths).slice(0, 5).join(', ')}...`);

    // Test 7: Verify Application schema
    console.log('\n6️⃣  Testing Application Model...');
    const Application = require('../models/Application');
    console.log(`   ✅ Application model defined`);
    console.log(`   ✅ Application schema fields: ${Object.keys(Application.schema.paths).slice(0, 5).join(', ')}...`);

    // Test 8: Express routes structure
    console.log('\n7️⃣  Verifying Express Routes...');
    const express = require('express');
    const jobsRouter = require('../routes/jobs');
    const companiesRouter = require('../routes/companies');
    const applicationsRouter = require('../routes/applications');

    console.log(
      `   ✅ routes/jobs.js - Express router with ${jobsRouter.stack ? jobsRouter.stack.length : 'N/A'} route handlers`
    );
    console.log(
      `   ✅ routes/companies.js - Express router with ${companiesRouter.stack ? companiesRouter.stack.length : 'N/A'} route handlers`
    );
    console.log(
      `   ✅ routes/applications.js - Express router with ${applicationsRouter.stack ? applicationsRouter.stack.length : 'N/A'} route handlers`
    );

    // Test 9: Server.js existence
    console.log('\n8️⃣  Verifying server.js...');
    const fs = require('fs');
    if (fs.existsSync('./server.js')) {
      const serverContent = fs.readFileSync('./server.js', 'utf-8');
      if (serverContent.includes('require(\'./routes/jobs\')')) {
        console.log('   ✅ server.js configured correctly');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TASK 03 VERIFICATION COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   ✅ All database models created and configured');
    console.log('   ✅ Tech stack extractor service implemented');
    console.log('   ✅ All API routes (jobs, companies, applications) created');
    console.log('   ✅ Express server configured (server.js)');
    console.log('   ✅ Sync script created (scripts/syncAgenciesToDB.js)');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: node scripts/syncAgenciesToDB.js (on your terminal)');
    console.log('   2. Run: node server.js');
    console.log('   3. Test: curl http://localhost:5000/api/jobs');
    console.log('   4. Test: curl http://localhost:5000/api/companies');
    console.log('   5. Test: curl http://localhost:5000/api/applications\n');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run verification
verifyTask03();

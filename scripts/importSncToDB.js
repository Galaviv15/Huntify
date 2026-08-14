const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db');
const Company = require('../models/Company');

async function importSncToDB() {
  try {
    // Step 1: Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...');
    await connectDB();

    // Step 2: Read companies.json file
    const companiesJsonPath = path.join(__dirname, '../data/companies.json');
    
    if (!fs.existsSync(companiesJsonPath)) {
      console.log(`⚠️  File not found: ${companiesJsonPath}`);
      console.log('📝 No data to import. Exiting gracefully.');
      await require('mongoose').disconnect();
      process.exit(0);
    }

    console.log(`\n📂 Reading companies data from: ${companiesJsonPath}`);
    const companiesData = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf-8'));
    
    if (!Array.isArray(companiesData)) {
      throw new Error('companies.json must contain an array of companies');
    }

    console.log(`✅ Loaded ${companiesData.length} companies from JSON\n`);

    // Step 3: Import/upsert companies into MongoDB
    let insertedCount = 0;
    let updatedCount = 0;
    const processedCompanies = [];

    console.log('🔄 Processing companies...');
    console.log('='.repeat(80));

    for (const company of companiesData) {
      if (!company.slug) {
        console.log(`⚠️  Skipping company without slug: ${company.name}`);
        continue;
      }

      const updateData = {
        name: company.name,
        websiteUrl: company.websiteUrl || '',
        linkedinUrl: company.linkedinUrl || '',
        sncUrl: company.sncUrl || '',
        overview: company.overview || '',
        foundedYear: company.foundedYear || 'N/A',
        businessModel: company.businessModel || 'B2B',
        employeeCount: company.employeeCount || 'N/A',
        fundingStage: company.fundingStage || 'N/A',
        fundingAmount: company.fundingAmount || 'N/A',
        stealthMode: company.stealthMode || false,
      };

      try {
        const result = await Company.updateOne(
          { slug: company.slug },
          { $set: updateData },
          { upsert: true }
        );

        if (result.upsertedId) {
          insertedCount++;
          console.log(`✨ INSERTED: ${company.name} (${company.slug})`);
        } else if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`🔄 UPDATED:  ${company.name} (${company.slug})`);
        } else {
          console.log(`⏭️  UNCHANGED: ${company.name} (${company.slug})`);
        }

        processedCompanies.push(company.name);
      } catch (error) {
        console.log(`❌ ERROR processing ${company.name}: ${error.message}`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 Import Summary:');
    console.log(`   📈 Total Processed: ${companiesData.length}`);
    console.log(`   ✨ Inserted:       ${insertedCount}`);
    console.log(`   🔄 Updated:        ${updatedCount}`);
    console.log(`   ⏭️  Unchanged:       ${companiesData.length - insertedCount - updatedCount}`);

    // Step 4: Verify import
    const totalInDB = await Company.countDocuments();
    console.log(`   💾 Total in DB:     ${totalInDB}`);

    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Step 5: Disconnect cleanly
    console.log('\n🔌 Closing database connection...');
    await require('mongoose').disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the import
importSncToDB();

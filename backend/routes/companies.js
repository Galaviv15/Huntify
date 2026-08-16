const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

/**
 * GET /api/companies
 * Query parameters:
 *   - search: text search by name
 *   - stage: filter by funding stage (e.g., "Seed", "Series A")
 *   - employeeCount: filter by employee count range (e.g., "10-50")
 *   - hasAts: filter by whether ATS is detected (true/false)
 *   - page: pagination (default 1)
 *   - limit: results per page (default 10)
 */
router.get('/', async (req, res) => {
  try {
    const { search, stage, employeeCount, hasAts, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by funding stage
    if (stage) {
      query['snc.stage'] = stage;
    }

    // Filter by employee count
    if (employeeCount) {
      query['snc.employeeCount'] = employeeCount;
    }

    // Filter by ATS detection
    if (hasAts === 'true') {
      query['ats.provider'] = { $ne: 'None' };
    } else if (hasAts === 'false') {
      query['ats.provider'] = 'None';
    }

    // Execute query
    const companies = await Company.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/:slug
 * Get a single company by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/stats/summary
 * Get statistics about companies
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Company.countDocuments();
    const withAts = await Company.countDocuments({ 'ats.provider': { $ne: 'None' } });

    const byFundingStage = await Company.aggregate([
      {
        $group: {
          _id: '$snc.stage',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byAtsProvider = await Company.aggregate([
      { $match: { 'ats.provider': { $ne: 'None' } } },
      {
        $group: {
          _id: '$ats.provider',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalCompanies: total,
        companiesWithAts: withAts,
        companiesByFundingStage: byFundingStage,
        companiesByAtsProvider: byAtsProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

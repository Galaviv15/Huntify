const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

/**
 * GET /api/jobs
 * Query parameters:
 *   - tech: comma-separated tech stack (e.g., "React,Node.js")
 *   - source: filter by source (AGENCY, DIRECT_ATS, or specific name like "Greenhouse")
 *   - search: text search across title, description, companyName
 *   - page: pagination (default 1)
 *   - limit: results per page (default 10)
 */
router.get('/', async (req, res) => {
  try {
    const { tech, source, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };

    // Filter by tech stack
    if (tech) {
      const techArray = tech.split(',').map((t) => t.trim());
      query.techStack = { $in: techArray };
    }

    // Filter by source
    if (source) {
      if (source === 'AGENCY' || source === 'DIRECT_ATS') {
        query.sourceType = source;
      } else {
        query.sourceName = source;
      }
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const jobs = await Job.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('companyRef', 'name slug');

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
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
 * GET /api/jobs/:id
 * Get a single job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('companyRef', 'name slug');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs/stats/summary
 * Get statistics about jobs in the database
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Job.countDocuments({ isActive: true });
    const bySource = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$sourceName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topTechStack = await Job.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$techStack' },
      {
        $group: {
          _id: '$techStack',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: {
        totalJobs: total,
        jobsBySource: bySource,
        topTechStack: topTechStack.map((item) => ({
          tech: item._id,
          count: item.count,
        })),
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

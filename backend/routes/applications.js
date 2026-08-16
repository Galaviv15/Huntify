const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * GET /api/applications
 * Get all applications with linked job data
 * Query parameters:
 *   - status: filter by status (SAVED, APPLIED, INTERVIEW, OFFER, REJECTED)
 *   - page: pagination (default 1)
 *   - limit: results per page (default 10)
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Execute query with job population
    const applications = await Application.find(query)
      .populate({
        path: 'jobRef',
        model: Job,
        select: 'title companyName location techStack sourceUrl',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
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
 * GET /api/applications/stats/summary
 * Get application tracking statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const byStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalApplications: total,
        applicationsByStatus: byStatus,
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
 * POST /api/applications
 * Add a new application (save a job to tracker)
 * Body: { jobId, status (optional, default "SAVED"), notes (optional) }
 */
router.post('/', async (req, res) => {
  try {
    const { jobId, status = 'SAVED', notes } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'jobId is required',
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    // Check if already tracked
    const existing = await Application.findOne({ jobRef: jobId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Job already in tracker',
      });
    }

    // Create application
    const application = new Application({
      jobRef: jobId,
      status,
      notes,
    });

    await application.save();
    await application.populate('jobRef', 'title companyName sourceUrl');

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/applications/:id
 * Update application status
 * Body: { status, appliedAt (optional), interviewDate (optional), notes (optional) }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status, appliedAt, interviewDate, notes } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        ...(status && { status }),
        ...(appliedAt && { appliedAt }),
        ...(interviewDate && { interviewDate }),
        ...(notes && { notes }),
      },
      { new: true }
    ).populate('jobRef', 'title companyName sourceUrl');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/applications/:id
 * Remove application from tracker
 */
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    res.json({
      success: true,
      message: 'Application deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

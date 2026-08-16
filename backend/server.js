const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import routes
const jobsRouter = require('./routes/jobs');
const companiesRouter = require('./routes/companies');
const applicationsRouter = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Huntify-Jobs API is running' });
});

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/applications', applicationsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
async function startServer() {
  console.log('\n📦 Attempting MongoDB connection...');

  connectDB()
    .then(() => {
      console.log('✅ MongoDB connection established.');
    })
    .catch((error) => {
      console.warn('⚠️ MongoDB unavailable at startup; continuing without database connection.');
      console.warn(error.message);
    });

  app.listen(PORT, () => {
    console.log(`\n✅ Huntify-Jobs API running on http://localhost:${PORT}`);
    console.log('\n📚 API Endpoints:');
    console.log('   GET  /health                    - Health check');
    console.log('   GET  /api/jobs                  - List jobs with filters');
    console.log('   GET  /api/jobs/:id              - Get single job');
    console.log('   GET  /api/jobs/stats/summary    - Job statistics');
    console.log('   GET  /api/companies             - List companies');
    console.log('   GET  /api/companies/:slug       - Get single company');
    console.log('   GET  /api/companies/stats/summary - Company statistics');
    console.log('   GET  /api/applications          - List applications');
    console.log('   POST /api/applications          - Add job to tracker');
    console.log('   PATCH /api/applications/:id     - Update application status');
    console.log('   DELETE /api/applications/:id    - Remove from tracker\n');
  });
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await require('mongoose').disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
});

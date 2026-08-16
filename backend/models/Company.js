const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    websiteUrl: String,
    ats: {
      provider: {
        type: String,
        enum: ['Greenhouse', 'Comeet', 'Lever', 'Ashby', 'Workable', 'None'],
        default: 'None',
      },
      slug: String,
      uid: String,
      careersUrl: String,
      lastCheckedAt: Date,
    },
    snc: {
      sncId: String,
      stage: String,
      foundedYear: Number,
      employeeCount: String,
      lastFundingAmount: String,
      lastFundingDate: String,
      description: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);

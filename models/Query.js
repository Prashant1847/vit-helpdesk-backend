import mongoose from 'mongoose';
import { QUERY_STATUS_LIST, QUERY_STATUSES, ROLE_LIST } from '../constants.js';


const QuerySchema = new mongoose.Schema({
  queryId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  files: [{ type: String }],
  status: { type: String, enum: QUERY_STATUS_LIST, default: QUERY_STATUSES.PENDING },
  publicConsent: { type: Boolean, default: false },
  markedPublic: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  forwardedTo: { type: String, default: null },
  notificationRequired: { type: Boolean, default: true },
  forwardingHistory: [{
    from: { type: String, required: true },
    to: { type: String, required: true },
    forwardedAt: { type: Date, dfault: Date.now },
    forwardedBy: {
      name: { type: String, required: true },
      email: { type: String, required: true }
    },
    note: { type: String }
  }],
  conversationHistory: [
    {
      from: { type: String, enum: ROLE_LIST, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      files: [{
        filename: String,
        originalname: String,
        path: String,
        mimetype: String
      }]
    }
  ],
  isPublic: { type: Boolean, default: false },
  public: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    response: { type: String, default: '' }
  },
  userConsent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
QuerySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Query = mongoose.model('Query', QuerySchema);

export default Query; 
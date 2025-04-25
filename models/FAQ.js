import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  department: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
FAQSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const FAQ = mongoose.model('FAQ', FAQSchema);

export default FAQ; 
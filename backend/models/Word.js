const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  kurukh_word: {
    type: String,
    required: true,
    indexed: true,
  },
  meanings: [
    {
      language: {
        type: String, // e.g., 'en', 'hi'
        required: true,
      },
      definition: {
        type: String,
        required: true,
      },
      example_sentence_kurukh: String,
      example_sentence_translation: String,
    },
  ],
  part_of_speech: String,
  pronunciation_guide: String,
  tags: [String],
  contributor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Word', WordSchema);

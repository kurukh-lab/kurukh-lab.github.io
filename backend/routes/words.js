const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');

const Word = require('../models/Word');
const User = require('../models/User');

// @route   POST api/words
// @desc    Add new word
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('kurukh_word', 'Kurukh word is required').not().isEmpty(),
      check('meanings', 'Meanings are required').isArray({ min: 1 }),
      check('meanings.*.language', 'Meaning language is required').not().isEmpty(),
      check('meanings.*.definition', 'Meaning definition is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { kurukh_word, meanings, part_of_speech, pronunciation_guide, tags } = req.body;

    try {
      const newWord = new Word({
        kurukh_word,
        meanings,
        part_of_speech,
        pronunciation_guide,
        tags,
        contributor_id: req.user.id,
      });

      const word = await newWord.save();
      res.json(word);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/words
// @desc    Get all words (or search by query)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let words;
    if (search) {
      // Basic search: looks for the search term in kurukh_word or in any definition
      // For more advanced search, consider using MongoDB text indexes or more complex queries
      words = await Word.find({
        $or: [
          { kurukh_word: { $regex: search, $options: 'i' } }, // Case-insensitive search for Kurukh word
          { 'meanings.definition': { $regex: search, $options: 'i' } } // Case-insensitive search in definitions
        ],
        status: 'approved', // Only show approved words
      }).populate('contributor_id', ['username']); // Populate contributor username
    } else {
      words = await Word.find({ status: 'approved' }).populate('contributor_id', ['username']);
    }
    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/words/:id
// @desc    Get word by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const word = await Word.findById(req.params.id)
      .populate('contributor_id', ['username']);

    if (!word || word.status !== 'approved') {
      // If word not found or not approved, and user is not the contributor or an admin (future)
      // For now, just check if approved
      return res.status(404).json({ msg: 'Word not found or not approved' });
    }
    res.json(word);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Word not found' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/words/:id
// @desc    Update word
// @access  Private (only contributor or admin)
router.put('/:id', auth, async (req, res) => {
    const { kurukh_word, meanings, part_of_speech, pronunciation_guide, tags, status } = req.body;

    // Build word object
    const wordFields = {};
    if (kurukh_word) wordFields.kurukh_word = kurukh_word;
    if (meanings) wordFields.meanings = meanings;
    if (part_of_speech) wordFields.part_of_speech = part_of_speech;
    if (pronunciation_guide) wordFields.pronunciation_guide = pronunciation_guide;
    if (tags) wordFields.tags = tags;
    // Add updatedAt timestamp
    wordFields.updatedAt = Date.now();

    // In a real app, you'd check if the user is an admin or the original contributor
    // For now, only the original contributor can update their own pending words.
    // Admin can update status.

    try {
        let word = await Word.findById(req.params.id);

        if (!word) return res.status(404).json({ msg: 'Word not found' });

        // Check user: only contributor or admin (for status changes)
        // For simplicity, we'll allow contributor to update if pending, admin to change status
        // This logic needs to be more robust in a full application

        const user = await User.findById(req.user.id);
        // A simple check if the user is an admin (e.g. by a role field, not implemented here)
        // const isAdmin = user.role === 'admin'; 

        if (word.contributor_id.toString() !== req.user.id /* && !isAdmin */) {
            // If not contributor and not admin (when status is being changed)
            if(status && /* isAdmin */ word.contributor_id.toString() === req.user.id) { // Allow contributor to resubmit, effectively changing status from rejected to pending
                 wordFields.status = 'pending_review';
            } else if (status /* && isAdmin */) {
                 // Only admin should be able to approve/reject directly
                 // For now, let's assume if status is in body, it's an admin action or contributor resubmitting
                 // This part needs proper role based access control
                 // return res.status(401).json({ msg: 'User not authorized to change status' });
                 wordFields.status = status; // Placeholder for admin action
            } else if (word.contributor_id.toString() !== req.user.id) {
                 return res.status(401).json({ msg: 'User not authorized' });
            }
        } else {
            // Contributor can update their words, or admin can update any word
            if (status /* && isAdmin */) {
                wordFields.status = status;
            } else if (status && word.contributor_id.toString() === req.user.id && word.status === 'rejected') {
                // If contributor is updating a rejected word, set it back to pending
                wordFields.status = 'pending_review';
            } else if (status && word.contributor_id.toString() === req.user.id) {
                // Contributor cannot change status directly unless it's from rejected to pending
                // Or if they are an admin (not implemented here)
            }
        }

        // Only allow updates to 'pending_review' or 'rejected' words by the contributor
        // unless the user is an admin (admin logic not fully implemented here)
        if (word.contributor_id.toString() === req.user.id && (word.status === 'approved') && !status /*&& !isAdmin*/) {
             return res.status(401).json({ msg: 'Cannot update an approved word. Contact admin.'});
        }

        word = await Word.findByIdAndUpdate(
            req.params.id,
            { $set: wordFields },
            { new: true }
        );

        res.json(word);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Word not found' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/words/:id
// @desc    Delete a word
// @access  Private (only contributor or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);

    if (!word) {
      return res.status(404).json({ msg: 'Word not found' });
    }

    // Check user: only contributor or admin
    // const user = await User.findById(req.user.id);
    // const isAdmin = user.role === 'admin'; // Assuming a role field

    if (word.contributor_id.toString() !== req.user.id /* && !isAdmin */) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Instead of deleting, mark as 'rejected' or a similar status, or move to an archive
    // For this example, we will delete it if it's 'pending_review' or 'rejected'
    // Approved words should ideally not be hard deleted by contributors.
    if (word.status === 'approved' /* && !isAdmin */) {
        return res.status(401).json({ msg: 'Cannot delete an approved word. Contact admin.' });
    }

    await Word.findByIdAndDelete(req.params.id);
    // await word.remove(); // findByIdAndRemove is deprecated

    res.json({ msg: 'Word removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Word not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addWord } from '../services/dictionaryService';

const Contribute = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kurukh_word: '',
    language: 'en', // default language (English)
    definition: '',
    example_sentence_kurukh: '',
    example_sentence_translation: '',
    part_of_speech: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.kurukh_word.trim() || !formData.definition.trim()) {
      setError('Kurukh word and definition are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      // Format the data according to our model
      const wordData = {
        kurukh_word: formData.kurukh_word.trim(),
        meanings: [
          {
            language: formData.language,
            definition: formData.definition.trim(),
            example_sentence_kurukh: formData.example_sentence_kurukh.trim(),
            example_sentence_translation: formData.example_sentence_translation.trim(),
          }
        ],
        part_of_speech: formData.part_of_speech.trim() || null,
      };
      
      const result = await addWord(wordData, currentUser.uid);
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          kurukh_word: '',
          language: 'en',
          definition: '',
          example_sentence_kurukh: '',
          example_sentence_translation: '',
          part_of_speech: '',
        });
        
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to add word');
      }
    } catch (err) {
      console.error('Error submitting word:', err);
      setError(err.message || 'An error occurred while submitting your contribution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Contribute to Kurukh Dictionary</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-6">You need to be logged in to contribute new words to the dictionary.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn btn-outline btn-primary"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Contribute to Kurukh Dictionary</h1>
      
      {success && (
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Thank you! Your word has been submitted successfully and is pending review.</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Kurukh Word *</span>
            </label>
            <input
              type="text"
              name="kurukh_word"
              value={formData.kurukh_word}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Language *</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Definition *</span>
            </label>
            <textarea
              name="definition"
              value={formData.definition}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Example Sentence (in Kurukh)</span>
            </label>
            <textarea
              name="example_sentence_kurukh"
              value={formData.example_sentence_kurukh}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="2"
            ></textarea>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Example Sentence Translation</span>
            </label>
            <textarea
              name="example_sentence_translation"
              value={formData.example_sentence_translation}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="2"
            ></textarea>
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Part of Speech</span>
            </label>
            <select
              name="part_of_speech"
              value={formData.part_of_speech}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">-- Select --</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                'Submit Word'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contribute;

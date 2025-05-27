import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitCorrection } from '../../services/dictionaryService';

const SuggestCorrectionModal = ({ wordId, wordText, currentWord, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [correctionType, setCorrectionType] = useState('');
  const [proposedChange, setProposedChange] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to suggest a correction.');
      return;
    }
    
    if (!correctionType || !proposedChange) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await submitCorrection(wordId, currentUser.uid, {
        type: correctionType,
        proposedChange,
        explanation,
        currentValue: getCurrentValue()
      });
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setCorrectionType('');
        setProposedChange('');
        setExplanation('');
        
        // Close modal after 3 seconds on success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit correction');
      }
    } catch (err) {
      console.error('Error submitting correction:', err);
      setError('An error occurred while submitting your correction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentValue = () => {
    switch (correctionType) {
      case 'word_spelling':
        return currentWord?.kurukh_word || '';
      case 'definition':
        return currentWord?.meanings?.[0]?.definition || '';
      case 'part_of_speech':
        return currentWord?.part_of_speech || '';
      case 'example_sentence':
        return currentWord?.meanings?.[0]?.example_sentence_kurukh || '';
      case 'example_translation':
        return currentWord?.meanings?.[0]?.example_sentence_translation || '';
      default:
        return '';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-2">Suggest Correction</h3>
        <p className="py-2 text-sm text-gray-600">
          Help improve the dictionary by suggesting corrections for: <span className="font-medium text-primary">{wordText}</span>
        </p>
        
        {!currentUser ? (
          <div className="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You must be logged in to suggest corrections.</span>
          </div>
        ) : success ? (
          <div className="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Thank you! Your correction has been submitted and will be reviewed by the community.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error mt-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">What would you like to correct? *</span>
              </label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="">-- Select what to correct --</option>
                <option value="word_spelling">Word Spelling</option>
                <option value="definition">Definition/Meaning</option>
                <option value="part_of_speech">Part of Speech</option>
                <option value="example_sentence">Example Sentence (Kurukh)</option>
                <option value="example_translation">Example Translation</option>
                <option value="pronunciation">Pronunciation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {correctionType && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Current Value</span>
                </label>
                <div className="p-3 bg-gray-100 rounded-lg text-sm">
                  {getCurrentValue() || 'No current value'}
                </div>
              </div>
            )}
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Proposed Correction *</span>
              </label>
              <textarea
                value={proposedChange}
                onChange={(e) => setProposedChange(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Enter your suggested correction here"
                rows="3"
                required
              ></textarea>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Explanation (Optional)</span>
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Explain why you think this correction is needed (sources, references, etc.)"
                rows="2"
              ></textarea>
            </div>

            <div className="alert alert-info mt-4 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Your correction will be marked for community review. Both admins and experienced users can review and approve it.
              </span>
            </div>
            
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !correctionType || !proposedChange}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Correction'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default SuggestCorrectionModal;

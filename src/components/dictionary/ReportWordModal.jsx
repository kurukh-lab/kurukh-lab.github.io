import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportWord } from '../../services/dictionaryService';

const ReportWordModal = ({ wordId, wordText, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to report a word.');
      return;
    }
    
    if (!reason) {
      setError('Please select a reason for your report.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await reportWord(wordId, currentUser.uid, reason, details);
      if (result.success) {
        setSuccess(true);
        // Reset form
        setReason('');
        setDetails('');
        
        // Close modal after 3 seconds on success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('An error occurred while submitting your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Report an Issue</h3>
        <p className="py-2">Reporting word: <span className="font-medium">{wordText}</span></p>
        
        {!currentUser ? (
          <div className="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You must be logged in to report a word.</span>
          </div>
        ) : success ? (
          <div className="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Thank you! Your report has been submitted successfully.</span>
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
                <span className="label-text">Reason for report *</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="">-- Select a reason --</option>
                <option value="incorrect_definition">Incorrect Definition</option>
                <option value="incorrect_spelling">Incorrect Spelling</option>
                <option value="incorrect_example">Incorrect Example</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="duplicate_word">Duplicate Word</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Additional details</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Please provide any additional information about the issue"
                rows="3"
              ></textarea>
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
                disabled={submitting || !reason}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
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

export default ReportWordModal;

import React from 'react';
import { FaSearch } from 'react-icons/fa'; // Assuming you use react-icons

/**
 * A custom search button component with search engine styling
 * @param {object} props Component props 
 * @param {boolean} [props.loading] Whether the button is in loading state
 * @param {boolean} [props.disabled] Whether the button is disabled
 * @param {function} [props.onClick] Click handler
 */
const SearchButton = ({ loading, disabled, onClick, children, ...rest }) => {
  return (
    <button 
      type="button"
      onClick={onClick} 
      disabled={disabled || loading} 
      className="btn btn-primary join-item" // Assuming you have Tailwind CSS classes for styling
    >
      {loading ? (
        <span className="loading loading-spinner"></span> // Example loading spinner
      ) : (
        <FaSearch />
      )}
    </button>
  );
};

export default SearchButton;

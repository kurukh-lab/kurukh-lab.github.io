import React from 'react';
import { Button } from 'react-daisyui';

/**
 * A custom search button component with search engine styling
 * @param {object} props Component props 
 * @param {boolean} [props.loading] Whether the button is in loading state
 * @param {boolean} [props.disabled] Whether the button is disabled
 * @param {function} [props.onClick] Click handler
 */
const SearchButton = ({ loading, disabled, onClick, children, ...rest }) => {
  return (
    <Button
      type="submit"
      className="btn-primary rounded-full px-6 shadow-md transition-all hover:shadow-lg"
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <>
          {children || (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              Search
            </>
          )}
        </>
      )}
    </Button>
  );
};

export default SearchButton;

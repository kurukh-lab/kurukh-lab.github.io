import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FaSearch } from 'react-icons/fa';

export interface SearchButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  loading?: boolean;
  children?: ReactNode;
}

const SearchButton = ({
  loading,
  disabled,
  onClick,
  children,
  ...rest
}: SearchButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className="btn btn-primary join-item"
    {...rest}
  >
    {loading ? (
      <span className="loading loading-spinner"></span>
    ) : (
      children ?? <FaSearch />
    )}
  </button>
);

export default SearchButton;

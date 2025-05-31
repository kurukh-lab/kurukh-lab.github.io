import React from 'react';

/**
 * StateFilter Component
 * 
 * Reusable filter component for filtering items by their review states.
 * Can be used for both words and corrections filtering.
 */
const StateFilter = ({ 
  states, 
  selectedStates, 
  onSelectionChange, 
  title = "Filter by State",
  multiSelect = true,
  disabled = false
}) => {
  const handleStateToggle = (state) => {
    if (disabled) return;
    
    if (multiSelect) {
      const newSelection = selectedStates.includes(state)
        ? selectedStates.filter(s => s !== state)
        : [...selectedStates, state];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([state]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onSelectionChange(states.map(s => s.value));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  return (
    <div className="card bg-base-100 shadow-sm border">
      <div className="card-body p-4">
        <h3 className="card-title text-sm font-medium mb-3">{title}</h3>
        
        {/* Select All / Clear All buttons */}
        {multiSelect && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleSelectAll}
              disabled={disabled || selectedStates.length === states.length}
              className="btn btn-xs btn-outline"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              disabled={disabled || selectedStates.length === 0}
              className="btn btn-xs btn-outline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* State checkboxes/radio buttons */}
        <div className="space-y-2">
          {states.map((state) => (
            <label key={state.value} className="label cursor-pointer justify-start gap-3">
              <input
                type={multiSelect ? "checkbox" : "radio"}
                name={multiSelect ? undefined : "state-filter"}
                checked={selectedStates.includes(state.value)}
                onChange={() => handleStateToggle(state.value)}
                disabled={disabled}
                className={multiSelect ? "checkbox checkbox-sm" : "radio radio-sm"}
              />
              <div className="flex items-center gap-2">
                <span className={`badge badge-sm ${state.badgeClass || 'badge-neutral'}`}>
                  {state.label}
                </span>
                {state.count !== undefined && (
                  <span className="text-xs text-gray-500">({state.count})</span>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Show selected count for multi-select */}
        {multiSelect && (
          <div className="text-xs text-gray-500 mt-3">
            {selectedStates.length} of {states.length} states selected
          </div>
        )}
      </div>
    </div>
  );
};

export default StateFilter;

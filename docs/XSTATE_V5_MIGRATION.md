# XState v5 Migration Notes

This document outlines the changes made to migrate the word review system from XState v4 to XState v5.

## API Changes

XState v5 introduced several API changes that required updates to our implementation:

### 1. Actor Model

XState v5 adopts an actor model where state machines are interpreted as actors. We updated:

- Replaced `useInterpret` with `createActor` + `useActor`
- Updated context initialization with the new `input` property

### 2. Machine Definition

- Removed `predictableActionArguments` (no longer needed in v5)
- Updated `context` to be a function that accepts input
- Changed `data` to `output` in final states
- Moved actions into the main machine definition object

### 3. Component Updates

- Updated `WordReviewStateMachine` to work with the new machine structure
- Fixed state visualization to work with XState v5's format
- Updated `useWordReview` hook to use the new API

## Files Changed

1. `/src/hooks/useWordReview.js` - Updated to use v5 API with actors
2. `/src/state/wordReviewMachine.js` - Updated machine definition
3. `/src/components/WordReviewStateMachine.jsx` - Updated visualization

## Testing

The application has been tested in both development and production modes:

- Build completes successfully
- Dev server starts without errors
- State transitions work correctly
- Real-time updates continue to function

## Future Considerations

- Consider using XState v5's new features like actors for more complex behavior
- Look into the improved inspector tools for debugging
- Explore typed machines using TypeScript for better type safety

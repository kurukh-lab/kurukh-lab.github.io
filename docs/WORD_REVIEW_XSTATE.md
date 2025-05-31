# XState Word Review System

This section describes the state machine implementation for word review processes in the Kurukh Dictionary application.

## Overview

We use [XState](https://xstate.js.org/) to manage the word review workflow, providing a structured and visual way to understand and control how words progress through different review states. This implementation makes the review process more predictable, transparent, and easier to maintain.

## Key Features

- **State Machine**: A formal state machine defines all possible states and transitions for word review
- **Visualization**: Visual representation of the state machine for developers and admins
- **Firebase Integration**: Seamless integration with Firestore for state persistence
- **History Tracking**: Tracks the full history of state transitions
- **React Hooks**: Simple integration with React components

## Usage

### Admin Dashboard

The Admin Dashboard now includes:

1. Word review statistics showing counts and percentages of words in each state
2. Link to a visual demo of the state machine
3. Integration with the existing word approval/rejection flows

### Demo Page

A demonstration page is available at `/word-review-demo` in development mode that shows:

1. A visualization of the full state machine
2. Current state of selected words
3. Available transitions based on user role and current state
4. History of state transitions

## Documentation

For a complete technical overview of the implementation, see [XState Implementation Documentation](docs/XSTATE_IMPLEMENTATION.md).

## Further Resources

- [XState Documentation](https://xstate.js.org/docs/)
- [Statecharts: A Visual Formalism For Complex Systems](https://www.sciencedirect.com/science/article/pii/0167642387900359/pdf)

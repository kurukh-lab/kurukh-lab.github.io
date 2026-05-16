import { useEffect, useState } from 'react';
import { wordReviewMachine } from '../state/wordReviewMachine';

interface Transition {
  event: string;
  target: string;
}

const WordReviewStateMachine = () => {
  const [states, setStates] = useState<string[]>([]);
  const [transitions, setTransitions] = useState<Record<string, Transition[]>>({});

  useEffect(() => {
    const machineConfig = wordReviewMachine.config as {
      states?: Record<string, { on?: Record<string, unknown> }>;
    };
    const stateList = Object.keys(machineConfig.states || {});
    setStates(stateList);

    const transitionsMap: Record<string, Transition[]> = {};

    stateList.forEach((state) => {
      transitionsMap[state] = [];
      const stateDefinition = machineConfig.states?.[state];
      const stateTransitions = stateDefinition?.on || {};

      Object.entries(stateTransitions).forEach(([event, eventConfig]) => {
        if (Array.isArray(eventConfig)) {
          eventConfig.forEach((config: { target?: string }) => {
            if (config.target) {
              transitionsMap[state].push({ event, target: config.target });
            }
          });
        } else if (
          typeof eventConfig === 'object' &&
          eventConfig !== null &&
          'target' in (eventConfig as Record<string, unknown>) &&
          typeof (eventConfig as { target?: string }).target === 'string'
        ) {
          transitionsMap[state].push({
            event,
            target: (eventConfig as { target: string }).target,
          });
        }
      });
    });

    setTransitions(transitionsMap);
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="border rounded-md p-4 bg-white mb-8">
      <h2 className="font-bold text-xl mb-4">Word Review State Machine</h2>

      <div className="overflow-x-auto mb-4">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Current State</th>
              <th>Event</th>
              <th>Next State</th>
            </tr>
          </thead>
          <tbody>
            {states.flatMap(
              (state) =>
                transitions[state]?.map((transition, idx) => (
                  <tr key={`${state}-${transition.event}-${idx}`}>
                    <td className="font-mono text-sm">{state}</td>
                    <td className="font-mono text-sm bg-blue-50">{transition.event}</td>
                    <td className="font-mono text-sm">{transition.target}</td>
                  </tr>
                )) || [],
            )}
          </tbody>
        </table>
      </div>

      <h3 className="font-bold text-lg mb-2">State Flow Diagram</h3>
      <div className="p-4 border rounded-md bg-gray-50 overflow-x-auto">
        <div className="flex flex-wrap gap-4 mb-6">
          {states.map((state) => (
            <div
              key={state}
              className="px-3 py-2 bg-white border rounded-md shadow-sm text-center"
            >
              {state}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-2">Flow:</p>
        <code className="text-xs block whitespace-pre-wrap bg-white p-3 border rounded-md">
          draft → submitted → pendingCommunityReview → inCommunityReview → communityApproved →
          pendingAdminReview → inAdminReview → approved
        </code>
      </div>
    </div>
  );
};

export default WordReviewStateMachine;

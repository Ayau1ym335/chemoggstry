import { useState, useEffect } from 'react';
import { predictYield, registerResult } from '../api/runsApi';

const VALID_YIELD = v => !isNaN(v) && v >= 0 && v <= 100;

/**
 * useExperimentRunner
 *
 * Manages the 5-phase state machine for a single experiment iteration:
 *   awaitingPrediction → predicting → predictionShown → submitting → resultRegistered
 *
 * Extracted from ExperimentRunner.jsx so the component only handles rendering.
 *
 * @param {string}  runId
 * @param {object}  suggestedConditions
 * @param {number}  iterationCount - changes when a new iteration starts (triggers reset)
 */
export function useExperimentRunner(runId, suggestedConditions, iterationCount) {
  const [phase, setPhase]                   = useState('awaitingPrediction');
  const [predictedYield, setPredictedYield] = useState(null);
  const [actualYield, setActualYield]       = useState('');
  const [iterationResult, setIterationResult] = useState(null);
  const [error, setError]                   = useState(null);

  // Reset when a new iteration begins
  useEffect(() => {
    setPhase('awaitingPrediction');
    setPredictedYield(null);
    setActualYield('');
    setIterationResult(null);
    setError(null);
  }, [iterationCount, suggestedConditions]);

  async function handlePredict() {
    if (!runId || !suggestedConditions) return;
    setPhase('predicting');
    setError(null);
    try {
      const data = await predictYield(runId, suggestedConditions);
      setPredictedYield(data.predictedYield);
      setPhase('predictionShown');
    } catch (err) {
      setError(err.message);
      setPhase('awaitingPrediction');
    }
  }

  async function handleSubmitResult() {
    const num = Number(actualYield);
    if (!VALID_YIELD(num)) return;
    setPhase('submitting');
    setError(null);
    try {
      const result = await registerResult(runId, num);
      setIterationResult(result);
      setPhase('resultRegistered');
    } catch (err) {
      setError(err.message);
      setPhase('predictionShown');
    }
  }

  const numActual = Number(actualYield);
  const isSubmitDisabled =
    actualYield === '' || !VALID_YIELD(numActual) || phase === 'submitting';

  return {
    phase,
    predictedYield,
    actualYield,
    setActualYield,
    iterationResult,
    error,
    isSubmitDisabled,
    handlePredict,
    handleSubmitResult,
  };
}

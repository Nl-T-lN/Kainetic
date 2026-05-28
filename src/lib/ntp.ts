export interface NTPMeasurement {
  t0: number; // Client sends request
  t1: number; // Server (Host) receives request
  t2: number; // Server (Host) sends response
  t3: number; // Client receives response
  roundTripDelay: number;
  clockOffset: number;
}

/**
 * Estimate clock offset using min-RTT selection.

 */
export const calculateOffsetEstimate = (measurements: NTPMeasurement[]) => {
  let minRTT = Infinity;
  let bestOffset = 0;
  for (const m of measurements) {
    if (m.roundTripDelay < minRTT) {
      minRTT = m.roundTripDelay;
      bestOffset = m.clockOffset;
    }
  }

  const totalRoundTrip = measurements.reduce((sum, m) => sum + m.roundTripDelay, 0);
  const averageRoundTrip = measurements.length > 0 ? totalRoundTrip / measurements.length : 0;

  return { averageOffset: bestOffset, averageRoundTrip, minRTT };
};

export const createMeasurement = (t0: number, t1: number, t2: number, t3: number): NTPMeasurement => {
  // RTT = (t3 - t0) - (t2 - t1)
  const roundTripDelay = (t3 - t0) - (t2 - t1);
  // Offset = ((t1 - t0) + (t2 - t3)) / 2
  const clockOffset = ((t1 - t0) + (t2 - t3)) / 2;

  return { t0, t1, t2, t3, roundTripDelay, clockOffset };
};

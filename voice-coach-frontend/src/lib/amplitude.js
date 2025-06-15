import * as amplitude from '@amplitude/analytics-browser';

export function initAmplitude() {
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
}

export default amplitude;
import type { Coordinates } from './weather'

export type GeolocationErrorReason = 'denied' | 'unavailable' | 'timeout' | 'unsupported'

/** Discriminated union: `status` tells TypeScript which other fields exist. */
export type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coordinates: Coordinates }
  | { status: 'error'; reason: GeolocationErrorReason }

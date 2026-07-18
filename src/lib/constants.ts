/** Cache revalidate intervals (seconds) for unstable_cache wrappers. */
export const CACHE_REVALIDATE_SECONDS = {
  slow: 300,
  menu: 120
} as const;

/** In-memory rate limits for public / auth Server Actions. */
export const RATE_LIMITS = {
  adminLogin: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000
  },
  customerClub: {
    maxAttempts: 8,
    windowMs: 60 * 60 * 1000
  }
} as const;

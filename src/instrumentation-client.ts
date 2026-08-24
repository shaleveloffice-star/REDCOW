/**
 * Next.js + Turbopack (dev) can call performance.measure with a negative
 * timestamp when a route aborts early (e.g. notFound/redirect/HMR).
 * That throws in the browser overlay even though the app is fine.
 * @see https://github.com/vercel/next.js/issues/86060
 */
if (process.env.NODE_ENV === "development") {
  const originalMeasure = performance.measure.bind(performance);

  performance.measure = ((...args: Parameters<typeof performance.measure>) => {
    try {
      return originalMeasure(...args);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("negative time stamp")
      ) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw error;
    }
  }) as typeof performance.measure;
}

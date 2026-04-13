export function computeReviewStats(reviews: Record<string, unknown>[]) {
  const arr = Array.isArray(reviews) ? reviews : [];
  const counts = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of arr) {
    const rating = typeof r.rating === 'number' ? Math.round(r.rating) : 0;
    if (rating >= 1 && rating <= 5) {
      counts[5 - rating]++;
      sum += rating;
    }
  }
  const total = arr.length;
  return {
    avgRating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    totalCount: total,
    distribution: counts.reverse(),
  };
}

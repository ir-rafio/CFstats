export const checkRecent = (time: Date, threshold: number): boolean => {
  const currentTime = new Date();
  const comparisonTime = currentTime.getTime() - threshold * 1000;

  return time.getTime() >= comparisonTime;
};

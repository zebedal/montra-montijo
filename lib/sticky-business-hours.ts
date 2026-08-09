type StickyBusinessHoursMeasurements = {
  viewportWidth: number;
  viewportHeight: number;
  contentHeight: number;
  topOffset: number;
  bottomSpacing?: number;
};

export function canUseStickyBusinessHours({
  viewportWidth,
  viewportHeight,
  contentHeight,
  topOffset,
  bottomSpacing = 24
}: StickyBusinessHoursMeasurements) {
  const isDesktop = viewportWidth >= 1024;
  const availableHeight = viewportHeight - topOffset - bottomSpacing;

  return isDesktop && availableHeight > 0 && contentHeight <= availableHeight;
}

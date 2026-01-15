export function extractUTMParameters(payload: any): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
} {
  try {
    const tracking = payload?.payload?.tracking;

    // Helper to normalize empty strings to null
    const normalizeValue = (value: any): string | null => {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
      return null;
    };

    return {
      utm_source: normalizeValue(tracking?.utm_source),
      utm_medium: normalizeValue(tracking?.utm_medium),
      utm_campaign: normalizeValue(tracking?.utm_campaign),
      utm_term: normalizeValue(tracking?.utm_term),
      utm_content: normalizeValue(tracking?.utm_content)
    };
  } catch (error) {
    console.error('UTM extraction failed:', error);
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null
    };
  }
}

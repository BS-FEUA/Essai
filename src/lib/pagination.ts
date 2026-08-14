export function getPagination(searchParams: URLSearchParams, defaultLimit: number, maxLimit = 100) {
  const parsePositiveInteger = (value: string | null, fallback: number) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
  };

  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const limit = Math.min(parsePositiveInteger(searchParams.get('limit'), defaultLimit), maxLimit);
  return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}

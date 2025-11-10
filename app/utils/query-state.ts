import _ from "lodash";

export interface QueryState<TFilters, TQuickFilters> {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  order?: string;
  filters?: TFilters;
  quickFilters?: TQuickFilters;
  keyword?: string;
  tab?: string;
}

export interface UseQueryStateOptions {
  prefix?: string;
}

/**
 * Convert a filters object into a tidy { 'filter_key': value } format
 */
const flattenFilters = <T extends Record<string, unknown>>(
  filters: T = {} as T,
  prefix = "",
): Record<string, string> => {
  return _(filters)
    .pickBy((v) => !_.isNil(v) && v !== "")
    .mapKeys((_v, k) => `${prefix}${k}`)
    .mapValues(String)
    .value();
};

/**
 * Extract filters from URLSearchParams based on a prefix (filter_ / quick_)
 */
const extractFiltersFromParams = <T extends Record<string, unknown>>(
  params: URLSearchParams,
  prefix = "",
): T => {
  return _(Array.from(params.entries()))
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, value]) => [key.replace(prefix, ""), value])
    .fromPairs()
    .value() as T;
};

/**
 * Parse URLSearchParams or request.url into QueryState
 */
export function parseQueryState<
  TFilters extends Record<string, unknown>,
  TQuickFilters extends Record<string, unknown> = Record<string, unknown>,
>(
  source: string | URLSearchParams,
  options: UseQueryStateOptions = {},
  initial: Partial<QueryState<TFilters, TQuickFilters>> = {},
): QueryState<TFilters, TQuickFilters> {
  const params =
    typeof source === "string"
      ? new URL(source, "http://dummy.local").searchParams
      : source;

  const pf = _.trim(options.prefix);

  const getNum = (key: string, fallback: number): number =>
    _.toNumber(params.get(`${pf}${key}`)) || fallback;

  const getStr = (key: string, fallback = ""): string =>
    params.get(`${pf}${key}`) ?? fallback;

  const filters = extractFiltersFromParams<TFilters>(params, `${pf}filter_`);
  const quickFilters = extractFiltersFromParams<TQuickFilters>(
    params,
    `${pf}quick_`,
  );

  return _.defaultsDeep(
    {
      page: getNum("page", 1),
      pageSize: getNum("limit", 8),
      orderBy: getStr("orderBy"),
      order: getStr("order", "asc"),
      keyword: getStr("keyword"),
      tab: getStr("tab"),
      filters,
      quickFilters,
    },
    initial,
  );
}

/**
 * Build URLSearchParams from a QueryState
 */
export function buildSearchParams<
  TFilters extends Record<string, unknown>,
  TQuickFilters extends Record<string, unknown>,
>(
  state: QueryState<TFilters, TQuickFilters>,
  options: UseQueryStateOptions = {},
): URLSearchParams {
  const pf = _.trim(options.prefix);
  const params = new URLSearchParams();

  const set = (key: string, value: unknown) => {
    if (_.isNil(value) || (_.isString(value) && _.trim(value) === "")) return;
    params.set(`${pf}${key}`, String(value));
  };

  // Base params
  set("page", state.page);
  set("limit", state.pageSize);
  set("orderBy", state.orderBy);
  set("order", state.order);
  set("keyword", state.keyword);
  set("tab", state.tab);

  // Filters & quick filters
  const flat = {
    ...flattenFilters(state.filters ?? {}, `${pf}filter_`),
    ...flattenFilters(state.quickFilters ?? {}, `${pf}quick_`),
  };

  _.forOwn(flat, (v, k) => params.set(k, v));

  return params;
}

/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";

interface UseQueryStateOptions {
  prefix?: string;
}

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

type UpdateQueryPayload<TFilters, TQuickFilters> = Partial<
  QueryState<TFilters, TQuickFilters>
>;

type StringKeyRecord = Record<string, string | undefined>;

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null && !Array.isArray(val);

/**
 * Flatten an object into key=value pairs (stringified),
 * with an optional prefix for the key.
 */
const flattenFilters = <T extends Record<string, unknown>>(
  filters: T,
  prefix = "",
): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    result[`${prefix}${k}`] = String(v);
  });
  return result;
};

/**
 * Extract filter parameters from URLSearchParams that match a given prefix.
 */
const extractFiltersFromParams = <T extends Record<string, unknown>>(
  params: URLSearchParams,
  prefix = "",
): T => {
  const filters: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith(prefix)) {
      const cleanKey = key.replace(prefix, "");
      filters[cleanKey] = value;
    }
  });
  return filters as unknown as T;
};

export const useQueryState = <
  TFilters extends Record<string, unknown>,
  TQuickFilters extends Record<string, unknown> = Record<string, unknown>,
>(
  initialQuery: Partial<QueryState<TFilters, TQuickFilters>> = {
    order: "asc",
    pageSize: 8,
  },
  { prefix = "" }: UseQueryStateOptions = {},
) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryObjRef = useRef<StringKeyRecord>({});
  const pf = prefix.trim();

  const [$page, $pageSize, $orderBy, $order, $keyword, $tab] = useMemo(
    () => [
      `${pf}page`,
      `${pf}limit`,
      `${pf}orderBy`,
      `${pf}order`,
      `${pf}keyword`,
      `${pf}tab`,
    ],
    [pf],
  );

  const initialQueryPrefix = useMemo(() => {
    return Object.fromEntries(
      Object.entries(initialQuery).map(([key, value]) => {
        const strVal = isObject(value) ? JSON.stringify(value) : String(value);
        return [`${prefix}${key}`, strVal];
      }),
    );
  }, [initialQuery, prefix]);

  useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    queryObjRef.current = {
      ...initialQueryPrefix,
      ...params,
    };
  }, [searchParams, initialQueryPrefix]);

  const getQueryValue = useCallback(
    <T = string>(key: string, fallback?: T): T => {
      const raw = queryObjRef.current?.[key];
      if (!raw) return fallback as T;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as T;
      }
    },
    [],
  );

  const page = useMemo(() => {
    const pageNum = Number(queryObjRef.current?.[$page]);
    return isNaN(pageNum) ? 1 : pageNum;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const size = Number(queryObjRef.current?.[$pageSize]);
    return isNaN(size) ? 8 : size;
  }, [searchParams]);

  const order = useMemo(
    () => getQueryValue<string>($order, ""),
    [searchParams],
  );

  const orderBy = useMemo(
    () => getQueryValue<string>($orderBy, ""),
    [searchParams],
  );

  const keyword = useMemo(
    () => getQueryValue<string>($keyword, ""),
    [searchParams],
  );

  const tab = useMemo(
    () => getQueryValue<string>($tab, initialQueryPrefix[$tab] as string),
    [searchParams],
  );

  // 🧩 Parse filters from URL (typed)
  const filters = useMemo(
    () => extractFiltersFromParams<TFilters>(searchParams, `${pf}filter_`),
    [searchParams, pf],
  );

  const quickFilters = useMemo(
    () => extractFiltersFromParams<TQuickFilters>(searchParams, `${pf}quick_`),
    [searchParams, pf],
  );

  // 🧭 Update URL helper
  const updateUrl = useCallback(
    (obj: UpdateQueryPayload<TFilters, TQuickFilters> = {}) => {
      const merged = new URLSearchParams(searchParams.toString());

      // Filters
      if (obj.filters) {
        Array.from(merged.keys())
          .filter((k) => k.startsWith(`${pf}filter_`))
          .forEach((k) => merged.delete(k));

        const flat = flattenFilters(obj.filters, `${pf}filter_`);
        Object.entries(flat).forEach(([k, v]) => merged.set(k, v));
      }

      // Quick filters
      if (obj.quickFilters) {
        Array.from(merged.keys())
          .filter((k) => k.startsWith(`${pf}quick_`))
          .forEach((k) => merged.delete(k));

        const flat = flattenFilters(obj.quickFilters, `${pf}quick_`);
        Object.entries(flat).forEach(([k, v]) => merged.set(k, v));
      }

      // Other fields
      Object.entries(obj).forEach(([key, value]) => {
        if (["filters", "quickFilters"].includes(key)) return;
        const fullKey = `${prefix}${key}`;
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        ) {
          merged.delete(fullKey);
        } else {
          merged.set(fullKey, String(value));
        }
      });

      navigate(`${location.pathname}?${merged.toString()}`, { replace: true });
    },
    [location.pathname, prefix, pf, searchParams],
  );

  // === Setter methods ===
  const setPage = useCallback(
    (val: number) => updateUrl({ page: val }),
    [updateUrl],
  );
  const setPageSize = useCallback(
    (val: number) => updateUrl({ pageSize: val, page: 1 }),
    [updateUrl],
  );
  const setOrder = useCallback(
    (val: string) => updateUrl({ order: val, page: 1 }),
    [updateUrl],
  );
  const setOrderBy = useCallback(
    (val: string) => updateUrl({ orderBy: val, page: 1 }),
    [updateUrl],
  );
  const setFilters = useCallback(
    (val: TFilters) => updateUrl({ filters: val, page: 1 }),
    [updateUrl],
  );
  const setQuickFilters = useCallback(
    (val: TQuickFilters) => updateUrl({ quickFilters: val, page: 1 }),
    [updateUrl],
  );
  const setKeyword = useCallback(
    (val: string) => updateUrl({ keyword: val, page: 1 }),
    [updateUrl],
  );
  const setTab = useCallback(
    (val: string) => updateUrl({ tab: val, page: 1 }),
    [updateUrl],
  );
  const setMultiple = useCallback(
    (vals: UpdateQueryPayload<TFilters, TQuickFilters>) =>
      updateUrl({ ...vals, page: 1 }),
    [updateUrl],
  );

  return {
    page,
    pageSize,
    filters,
    quickFilters,
    keyword,
    tab,
    order,
    orderBy,
    setPage,
    setPageSize,
    setFilters,
    setQuickFilters,
    setKeyword,
    setTab,
    setOrder,
    setOrderBy,
    setMultiple,
  };
};

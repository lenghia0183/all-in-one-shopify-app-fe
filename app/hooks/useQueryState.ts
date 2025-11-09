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

// Helper type to make string-keyed object
type StringKeyRecord = Record<string, string | undefined>;

export const useQueryState = <
  TFilters,
  TQuickFilters = Record<string, unknown>,
>(
  initialQuery: Partial<QueryState<TFilters, TQuickFilters>> = {
    order: "asc",
    pageSize: 8,
  },
  { prefix = "" }: UseQueryStateOptions = {},
) => {
  const searchParams = useSearchParams()[0];
  const location = useLocation();
  const navigate = useNavigate();

  // queryObjRef is a string-keyed object because all values are parsed from URLSearchParams
  const queryObjRef = useRef<StringKeyRecord>({});

  const pf = prefix.trim();

  const [
    $page,
    $pageSize,
    $orderBy,
    $order,
    $filters,
    $quickFilters,
    $keyword,
    $tab,
  ] = useMemo(
    () => [
      `${pf}page`,
      `${pf}limit`,
      `${pf}orderBy`,
      `${pf}order`,
      `${pf}filters`,
      `${pf}quickFilters`,
      `${pf}keyword`,
      `${pf}tab`,
    ],
    [pf],
  );

  const initialQueryPrefix = useMemo(() => {
    return Object.fromEntries(
      Object.entries(initialQuery).map(([key, value]) => {
        const strVal =
          typeof value === "object" ? JSON.stringify(value) : String(value);
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

  const filters = useMemo(
    () => getQueryValue<TFilters>($filters, {} as TFilters),
    [searchParams],
  );
  const quickFilters = useMemo(
    () => getQueryValue<TQuickFilters>($quickFilters, {} as TQuickFilters),
    [searchParams],
  );
  const keyword = useMemo(
    () => getQueryValue<string>($keyword, ""),
    [searchParams],
  );
  const order = useMemo(
    () => getQueryValue<string>($order, ""),
    [searchParams],
  );
  const orderBy = useMemo(
    () => getQueryValue<string>($orderBy, ""),
    [searchParams],
  );
  const tab = useMemo(
    () => getQueryValue<string>($tab, initialQueryPrefix[$tab] as string),
    [searchParams],
  );

  const deepClean = (data: unknown): unknown => {
    if (Array.isArray(data)) {
      const cleaned = data.map(deepClean).filter(Boolean);
      return cleaned.length > 0 ? cleaned : undefined;
    }
    if (typeof data === "object" && data !== null) {
      const obj = Object.fromEntries(
        Object.entries(data)
          .map(([k, v]) => [k, deepClean(v)])
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, v]) => v !== undefined),
      );
      return Object.keys(obj).length > 0 ? obj : undefined;
    }
    if (data === undefined || data === null || data === "") return undefined;
    return data;
  };

  const updateUrl = useCallback(
    (
      obj: UpdateQueryPayload<Partial<TFilters>, Partial<TQuickFilters>> = {},
      // scroll: boolean = false  // Removed unused parameter
    ) => {
      const merged: StringKeyRecord = {
        ...initialQueryPrefix,
        ...queryObjRef.current,
      };

      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = `${prefix}${key}`;
        const cleaned = deepClean(value);
        if (cleaned !== undefined) {
          merged[fullKey] =
            typeof cleaned === "object"
              ? JSON.stringify(cleaned)
              : String(cleaned);
        } else {
          delete merged[fullKey];
        }
      });

      const searchParams = new URLSearchParams();
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value);
        }
      });

      queryObjRef.current = merged;
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    },
    [location.pathname, prefix, initialQueryPrefix],
  );

  // Các setter
  const setPage = useCallback(
    (val: number) => {
      updateUrl({ page: val });
    },
    [updateUrl],
  );

  const setPageSize = useCallback(
    (val: number) => {
      updateUrl({ pageSize: val, page: 1 });
    },
    [updateUrl],
  );

  const setOrder = useCallback(
    (val: string) => {
      updateUrl({ order: val, page: 1 });
    },
    [updateUrl],
  );

  const setOrderBy = useCallback(
    (val: string) => {
      updateUrl({ orderBy: val, page: 1 });
    },
    [updateUrl],
  );

  const setFilters = useCallback(
    (val: Partial<TFilters>) => {
      updateUrl({ filters: val, page: 1 });
    },
    [updateUrl],
  );

  const setQuickFilters = useCallback(
    (val: Partial<TQuickFilters>) => {
      updateUrl({ quickFilters: val, page: 1 });
    },
    [updateUrl],
  );

  const setKeyword = useCallback(
    (val: string) => {
      updateUrl({ keyword: val, page: 1 });
    },
    [updateUrl],
  );

  const setTab = useCallback(
    (val: string) => {
      updateUrl({ tab: val, page: 1 });
    },
    [updateUrl],
  );

  const setMultiple = useCallback(
    (vals: UpdateQueryPayload<TFilters, TQuickFilters>) => {
      updateUrl({ ...vals, page: 1 });
    },
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

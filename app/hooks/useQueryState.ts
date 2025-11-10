import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";
import {
  QueryState,
  UseQueryStateOptions,
  parseQueryState,
  buildSearchParams,
} from "@/utils/query-state";
import _ from "lodash";

export function useQueryState<
  TFilters extends Record<string, unknown>,
  TQuickFilters extends Record<string, unknown> = Record<string, unknown>,
>(
  initial: Partial<QueryState<TFilters, TQuickFilters>> = {},
  options: UseQueryStateOptions = {},
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitial = useMemo(() => initial, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableOptions = useMemo(() => options, []);

  const state = useMemo(
    () =>
      parseQueryState<TFilters, TQuickFilters>(
        searchParams,
        stableOptions,
        stableInitial,
      ),
    [searchParams, stableOptions, stableInitial],
  );

  const updateUrl = useCallback(
    (patch: Partial<QueryState<TFilters, TQuickFilters>>) => {
      console.log("patch", patch);
      const merged = _.mergeWith(
        {},
        state,
        patch,
        (objValue, srcValue, key) => {
          if (key === "filters" || key === "quickFilters") return srcValue;
        },
      );

      const newParams = buildSearchParams(merged, stableOptions);
      // console.log(Object.fromEntries(newParams.entries()));
      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams, state, stableOptions],
  );

  return {
    ...state,
    setPage: (page: number) => updateUrl({ page }),
    setPageSize: (pageSize: number) => updateUrl({ pageSize, page: 1 }),
    setFilters: (filters: TFilters) => updateUrl({ filters, page: 1 }),
    setQuickFilters: (quickFilters: TQuickFilters) =>
      updateUrl({ quickFilters, page: 1 }),
    setOrder: (order: string) => updateUrl({ order, page: 1 }),
    setOrderBy: (orderBy: string) => updateUrl({ orderBy, page: 1 }),
    setKeyword: (keyword: string) => updateUrl({ keyword, page: 1 }),
    setTab: (tab: string) => updateUrl({ tab, page: 1 }),
    setMultiple: (vals: Partial<QueryState<TFilters, TQuickFilters>>) =>
      updateUrl({ ...vals, page: 1 }),
  };
}

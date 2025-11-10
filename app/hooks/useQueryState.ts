import { useLocation, useNavigate, useSearchParams } from "react-router";
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = useMemo(
    () =>
      parseQueryState<TFilters, TQuickFilters>(searchParams, options, initial),
    [searchParams, options, initial],
  );

  const updateUrl = useCallback(
    (patch: Partial<QueryState<TFilters, TQuickFilters>>) => {
      const merged = _.defaultsDeep({}, state, patch);
      const newParams = buildSearchParams(merged, options);
      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    },
    [navigate, location.pathname, state, options],
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

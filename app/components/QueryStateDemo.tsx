"use client";

import { useEffect, useState } from "react";
import { useQueryState } from "@/hooks/useQueryState";
import { QueryStateFilterBase } from "@/types/filter-base";

interface ProductFilters extends QueryStateFilterBase {
  category?: string;
  priceMin?: number;
  priceMax?: number;
}

interface QuickFilters extends QueryStateFilterBase {
  inStock?: boolean;
  onSale?: boolean;
}

export default function QueryStateDemo() {
  const {
    page,
    pageSize,
    orderBy,
    order,
    filters,
    quickFilters,
    keyword,
    tab,
    setPage,
    setPageSize,
    setFilters,
    setQuickFilters,
    setKeyword,
    setTab,
    setOrder,
    setOrderBy,
    setMultiple,
  } = useQueryState<ProductFilters, QuickFilters>({
    page: 1,
    pageSize: 10,
    order: "asc",
    orderBy: "name",
    filters: {},
    quickFilters: {},
    keyword: "",
    tab: "products",
  });

  /** ───────────────────────────────────────────────
   * Local UI state
   * ─────────────────────────────────────────────── */
  const [localKeyword, setLocalKeyword] = useState(keyword ?? "");
  const [localFilters, setLocalFilters] = useState<ProductFilters>({
    category: filters?.category ?? "",
    priceMin: filters?.priceMin ?? undefined,
    priceMax: filters?.priceMax ?? undefined,
  });
  const [localQuickFilters, setLocalQuickFilters] = useState<QuickFilters>({
    inStock: quickFilters?.inStock ?? false,
    onSale: quickFilters?.onSale ?? false,
  });

  console.log("localQuickFilter", localQuickFilters);
  console.log("localFilters", localFilters);

  /** Đồng bộ lại khi query state thay đổi (do back/forward URL) */
  useEffect(() => {
    setLocalKeyword(keyword ?? "");
    setLocalFilters({
      category: filters?.category ?? "",
      priceMin: filters?.priceMin,
      priceMax: filters?.priceMax,
    });
    setLocalQuickFilters({
      inStock: quickFilters?.inStock ?? false,
      onSale: quickFilters?.onSale ?? false,
    });
  }, [keyword, filters, quickFilters]);

  /** ───────────────────────────────────────────────
   * Handlers
   * ─────────────────────────────────────────────── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(localKeyword.trim());
  };

  const handleApplyFilters = () => {
    const newFilter = {
      category: localFilters.category || undefined,
      priceMin: localFilters.priceMin,
      priceMax: localFilters.priceMax,
    };

    const newQuickFilter = {
      inStock: localQuickFilters.inStock || undefined,
      onSale: localQuickFilters.onSale || undefined,
    };
    setMultiple({ filters: newFilter, quickFilters: newQuickFilter });
  };

  const handleSortChange = (newOrderBy: string) => {
    if (newOrderBy === orderBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(newOrderBy);
      setOrder("asc");
    }
  };

  const handleResetAll = () => {
    setMultiple({
      page: 1,
      pageSize: 10,
      order: "asc",
      orderBy: "name",
      filters: {},
      quickFilters: {},
      keyword: "",
      tab: "products",
    });
  };

  /** ───────────────────────────────────────────────
   * Render UI
   * ─────────────────────────────────────────────── */
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>useQueryState Demo</h2>

      {/* Tabs */}
      <div style={{ marginBottom: 16 }}>
        {["products", "categories", "brands"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              marginRight: 8,
              padding: "8px 16px",
              backgroundColor: tab === t ? "#007bff" : "#f8f9fa",
              color: tab === t ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          style={{
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            marginRight: 10,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h4>Filters</h4>
        <label>
          Category:
          <input
            value={localFilters.category ?? ""}
            onChange={(e) =>
              setLocalFilters((f) => ({ ...f, category: e.target.value }))
            }
            style={{ marginLeft: 10 }}
          />
        </label>
        <div style={{ marginTop: 10 }}>
          <label>
            Price:
            <input
              type="number"
              placeholder="Min"
              value={localFilters.priceMin ?? ""}
              onChange={(e) =>
                setLocalFilters((f) => ({
                  ...f,
                  priceMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              style={{ marginLeft: 10, width: 80 }}
            />
            <span style={{ margin: "0 10px" }}>to</span>
            <input
              type="number"
              placeholder="Max"
              value={localFilters.priceMax ?? ""}
              onChange={(e) =>
                setLocalFilters((f) => ({
                  ...f,
                  priceMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              style={{ width: 80 }}
            />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={localQuickFilters.inStock === true}
              onChange={(e) =>
                setLocalQuickFilters((q) => ({
                  ...q,
                  inStock: e.target.checked,
                }))
              }
              style={{ marginRight: 5 }}
            />
            In stock
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={localQuickFilters.onSale === true}
              onChange={(e) =>
                setLocalQuickFilters((q) => ({
                  ...q,
                  onSale: e.target.checked,
                }))
              }
              style={{ marginRight: 5 }}
            />
            On sale
          </label>
        </div>

        <button
          onClick={handleApplyFilters}
          style={{
            marginTop: 10,
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Sort */}
      <div style={{ marginBottom: 20 }}>
        <h4>Sort By</h4>
        {["name", "price", "date"].map((field) => (
          <button
            key={field}
            onClick={() => handleSortChange(field)}
            style={{
              marginRight: 8,
              padding: "8px 16px",
              backgroundColor: orderBy === field ? "#007bff" : "#f8f9fa",
              color: orderBy === field ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
            {orderBy === field ? (order === "asc" ? "↑" : "↓") : ""}
          </button>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginBottom: 20 }}>
        <h4>Pagination</h4>
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          style={{
            padding: "6px 12px",
            marginRight: 8,
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Prev
        </button>
        <span>
          Page <strong>{page}</strong>
        </span>
        <button
          onClick={() => setPage(page + 1)}
          style={{ padding: "6px 12px", marginLeft: 8 }}
        >
          Next
        </button>
        <div style={{ marginTop: 10 }}>
          <label>
            Items per page:
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleResetAll}
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        Reset All
      </button>

      {/* Current Query State */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 16,
          backgroundColor: "#f8f9fa",
        }}
      >
        <h4>Current Query State</h4>
        <pre>
          {JSON.stringify(
            {
              page,
              pageSize,
              orderBy,
              order,
              filters,
              quickFilters,
              keyword,
              tab,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

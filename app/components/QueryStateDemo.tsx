import { useQueryState } from "@/hooks/useQueryState";
import { QueryStateFilterBase } from "@/types/filter-base";
import { useState, useEffect } from "react";

// Define types for our filters
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
  // Initialize the hook with default values
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

  // Local state for form inputs
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localCategory, setLocalCategory] = useState(filters?.category || "");
  const [localPriceMin, setLocalPriceMin] = useState(
    filters?.priceMin?.toString() || "",
  );
  const [localPriceMax, setLocalPriceMax] = useState(
    filters?.priceMax?.toString() || "",
  );
  const [localInStock, setLocalInStock] = useState(
    quickFilters?.inStock || false,
  );
  const [localOnSale, setLocalOnSale] = useState(quickFilters?.onSale || false);
  console.log("filter", filters?.category);
  // Sync local state with query state when it changes
  useEffect(() => {
    setLocalKeyword(keyword);
    setLocalCategory(filters?.category || "");
    setLocalPriceMin(filters?.priceMin?.toString() || "");
    setLocalPriceMax(filters?.priceMax?.toString() || "");
    setLocalInStock(quickFilters?.inStock || false);
    setLocalOnSale(quickFilters?.onSale || false);
  }, [keyword, filters, quickFilters, tab]);

  // Handle form submission for keyword search
  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(localKeyword || "");
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    const newFilters: ProductFilters = {
      category: localCategory || undefined,
      priceMin: localPriceMin ? Number(localPriceMin) : undefined,
      priceMax: localPriceMax ? Number(localPriceMax) : undefined,
    };

    const newQuickFilters: QuickFilters = {
      inStock: localInStock,
      onSale: localOnSale,
    };

    setFilters(newFilters);
    setQuickFilters(newQuickFilters);
  };

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
  };

  // Handle sorting change
  const handleSortChange = (newOrderBy: string) => {
    // If same column, toggle direction
    if (newOrderBy === orderBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(newOrderBy);
      setOrder("asc");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Handle multiple changes at once
  const handleResetAll = () => {
    setMultiple({
      page: 1,
      pageSize: 10,
      orderBy: "name",
      order: "asc",
      filters: {},
      quickFilters: {},
      keyword: "",
      tab: "products",
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Query State Hook Demo</h1>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => handleTabChange("products")}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: tab === "products" ? "#007bff" : "#f8f9fa",
            color: tab === "products" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Products
        </button>
        <button
          onClick={() => handleTabChange("categories")}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: tab === "categories" ? "#007bff" : "#f8f9fa",
            color: tab === "categories" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Categories
        </button>
        <button
          onClick={() => handleTabChange("brands")}
          style={{
            padding: "8px 16px",
            backgroundColor: tab === "brands" ? "#007bff" : "#f8f9fa",
            color: tab === "brands" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Brands
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleKeywordSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="Search products..."
          style={{
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <h3>Filters</h3>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Category:
            <input
              type="text"
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Price Range:
            <input
              type="number"
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(e.target.value)}
              placeholder="Min"
              style={{
                marginLeft: "10px",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "80px",
              }}
            />
            <span style={{ margin: "0 10px" }}>to</span>
            <input
              type="number"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(e.target.value)}
              placeholder="Max"
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "80px",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <input
              type="checkbox"
              checked={localInStock}
              onChange={(e) => setLocalInStock(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            In Stock Only
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <input
              type="checkbox"
              checked={localOnSale}
              onChange={(e) => setLocalOnSale(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            On Sale
          </label>
        </div>

        <button
          onClick={handleApplyFilters}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Sorting Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Sort By</h3>
        <button
          onClick={() => handleSortChange("name")}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: orderBy === "name" ? "#007bff" : "#f8f9fa",
            color: orderBy === "name" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Name {orderBy === "name" && (order === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortChange("price")}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: orderBy === "price" ? "#007bff" : "#f8f9fa",
            color: orderBy === "price" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Price {orderBy === "price" && (order === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortChange("date")}
          style={{
            padding: "8px 16px",
            backgroundColor: orderBy === "date" ? "#007bff" : "#f8f9fa",
            color: orderBy === "date" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Date {orderBy === "date" && (order === "asc" ? "↑" : "↓")}
        </button>
      </div>

      {/* Pagination Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Pagination</h3>
        <div>
          <span>Page: </span>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            style={{
              marginRight: "5px",
              padding: "4px 8px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>{page}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            style={{
              marginLeft: "5px",
              padding: "4px 8px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
        <div style={{ marginTop: "10px" }}>
          <span>Items per page: </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={{
              padding: "4px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetAll}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Reset All Filters
      </button>

      {/* Display Current State */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h3>Current Query State</h3>
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

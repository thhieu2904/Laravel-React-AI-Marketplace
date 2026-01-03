import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product";
import { productService, ProductFilters } from "@/services/product.service";
import { Product, Category } from "@/types";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
  { value: "popular", label: "Phổ biến nhất" },
];

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [totalPages, setTotalPages] = useState(1);

  // Get filters from URL
  const filters: ProductFilters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) || "newest",
    page: parseInt(searchParams.get("page") || "1"),
    per_page: 12,
  };

  useEffect(() => {
    productService.getCategories().then((res) => {
      setCategories(res.data || []);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== "page") {
      newParams.delete("page"); // Reset page when changing filters
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filters.search && `Kết quả tìm kiếm: "${filters.search}"`}
            {!filters.search && "Tất cả sản phẩm điện lạnh"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select
            value={filters.sort || "newest"}
            onValueChange={(value) => updateFilter("sort", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden md:flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Danh mục
              </h3>
              <div className="space-y-2">
                <Button
                  variant={!filters.category ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => updateFilter("category", undefined)}
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={
                      filters.category === cat.slug ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => updateFilter("category", cat.slug)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.category) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={filters.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("page", page.toString())}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Không tìm thấy sản phẩm nào
              </p>
              <Button
                variant="link"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;

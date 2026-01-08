import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Star,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pagination, type PaginationMeta } from "@/components/ui/pagination";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";
import type { Product } from "@/types";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

export function AdminProducts() {
  const { token } = useAdminAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Debounced search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Quick edit states
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [stockValue, setStockValue] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [salePriceValue, setSalePriceValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    isDeleting: boolean;
  }>({ isOpen: false, product: null, isDeleting: false });

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 10,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "all") params.category_id = selectedCategory;

      const response = await api.get("/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setProducts(response.data.data || []);
      if (response.data.meta) {
        setPaginationMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await api.patch(
        `/admin/products/${product.id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleDelete = (product: Product) => {
    setDeleteModal({ isOpen: true, product, isDeleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await api.delete(
        `/admin/products/${deleteModal.product.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeleteModal({ isOpen: false, product: null, isDeleting: false });
      // Show success message from API (different message for soft vs hard delete)
      alert(response.data.message || "Thao tác thành công");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Có lỗi xảy ra khi xử lý sản phẩm");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleQuickUpdateStock = async (productId: number) => {
    if (!stockValue.trim()) return;
    setIsSaving(true);
    try {
      await api.put(
        `/admin/products/${productId}`,
        { stock_quantity: parseInt(stockValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingStock(null);
      fetchProducts();
    } catch (error) {
      alert("Không thể cập nhật tồn kho");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickUpdatePrice = async (productId: number) => {
    if (!priceValue.trim()) return;
    setIsSaving(true);
    try {
      await api.put(
        `/admin/products/${productId}`,
        {
          original_price: parseFloat(priceValue),
          sale_price: salePriceValue ? parseFloat(salePriceValue) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPrice(null);
      fetchProducts();
    } catch (error) {
      alert("Không thể cập nhật giá");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeatured = async (productId: number) => {
    try {
      await api.patch(
        `/admin/products/${productId}/toggle-featured`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state immediately for better UX
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, is_featured: !p.is_featured } : p
        )
      );
    } catch (error) {
      alert("Không thể cập nhật trạng thái nổi bật");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryName = (categoryId: number): string => {
    for (const cat of categories) {
      if (cat.id === categoryId) return cat.name;
      if (cat.children) {
        const child = cat.children.find((c) => c.id === categoryId);
        if (child) return child.name;
      }
    }
    return "—";
  };

  // Debounce search - trigger server fetch after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchQuery) {
        setSearchQuery(search);
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-gray-500 whitespace-nowrap">
              {paginationMeta.total} sản phẩm
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[380px]">Sản phẩm</TableHead>
                <TableHead className="w-[130px]">Danh mục</TableHead>
                <TableHead className="w-[150px]">Giá</TableHead>
                <TableHead className="w-[90px] text-center">Kho</TableHead>
                <TableHead className="w-[100px]">Trạng thái</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  {/* Product Name - Fixed width with truncate */}
                  <TableCell className="max-w-[380px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          product.images?.[0]?.image_url || "/placeholder.jpg"
                        }
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-gray-900 truncate max-w-[280px]">
                                {product.name}
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleFeatured(product.id);
                                    }}
                                    className="flex-shrink-0 p-0.5 hover:bg-amber-100 rounded transition-colors"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        product.is_featured
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-gray-300 hover:text-amber-400"
                                      }`}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>
                                    {product.is_featured
                                      ? "Bỏ nổi bật"
                                      : "Đánh dấu nổi bật"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{product.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-gray-500 truncate">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="w-[130px]">
                    <span className="text-sm text-gray-600 truncate block">
                      {getCategoryName(product.category_id)}
                    </span>
                  </TableCell>

                  {/* Price - Quick Edit */}
                  <TableCell className="w-[150px]">
                    <Popover
                      open={editingPrice === product.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setPriceValue(product.original_price.toString());
                          setSalePriceValue(
                            product.sale_price?.toString() || ""
                          );
                          setEditingPrice(product.id);
                        } else {
                          setEditingPrice(null);
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button className="text-left hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors group">
                          <p className="font-semibold text-green-600">
                            {formatPrice(
                              product.sale_price || product.original_price
                            )}
                          </p>
                          {product.sale_price &&
                            product.sale_price < product.original_price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(product.original_price)}
                              </p>
                            )}
                          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">
                            Click để sửa
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                        <div className="space-y-3">
                          <p className="font-medium text-sm">Cập nhật giá</p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-500">
                                Giá gốc
                              </label>
                              <Input
                                type="number"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                placeholder="VNĐ"
                                className="h-8"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">
                                Giá khuyến mãi (tùy chọn)
                              </label>
                              <Input
                                type="number"
                                value={salePriceValue}
                                onChange={(e) =>
                                  setSalePriceValue(e.target.value)
                                }
                                placeholder="Để trống nếu không giảm"
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleQuickUpdatePrice(product.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Stock - Quick Edit */}
                  <TableCell className="w-[90px] text-center">
                    <Popover
                      open={editingStock === product.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setStockValue(product.stock_quantity.toString());
                          setEditingStock(product.id);
                        } else {
                          setEditingStock(null);
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          className={`inline-flex items-center justify-center min-w-[45px] px-2.5 py-1 rounded-full text-sm font-semibold transition-colors hover:ring-2 hover:ring-offset-1 ${
                            product.stock_quantity > 0
                              ? "bg-blue-100 text-blue-700 hover:ring-blue-300"
                              : "bg-red-100 text-red-700 hover:ring-red-300"
                          }`}
                        >
                          {product.stock_quantity}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="center">
                        <div className="space-y-3">
                          <p className="font-medium text-sm">
                            Cập nhật tồn kho
                          </p>
                          <Input
                            type="number"
                            min="0"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            placeholder="Số lượng"
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleQuickUpdateStock(product.id);
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleQuickUpdateStock(product.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStock(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell className="w-[100px]">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        product.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {product.is_active ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Hiện
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Ẩn
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-[100px] text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        asChild
                      >
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {paginationMeta.last_page > 1 && (
            <div className="border-t px-4">
              <Pagination
                meta={paginationMeta}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, product: null, isDeleting: false });
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong className="text-gray-900">
                  "{deleteModal.product?.name}"
                </strong>
                ?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Lưu ý:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    Nếu sản phẩm <b>chưa có đơn hàng</b>: sẽ xóa hoàn toàn khỏi
                    hệ thống
                  </li>
                  <li>
                    Nếu sản phẩm <b>đã có đơn hàng</b>: sẽ chỉ ẩn để bảo toàn
                    lịch sử
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  product: null,
                  isDeleting: false,
                })
              }
              disabled={deleteModal.isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteModal.isDeleting}
            >
              {deleteModal.isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa sản phẩm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminProducts;

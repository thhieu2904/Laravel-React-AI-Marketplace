import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, type PaginationMeta } from "@/components/ui/pagination";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";
import type { Review } from "@/types";

export function AdminReviews() {
  const { token } = useAdminAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending"
  );
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Stats for filter badges
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // Fetch when filters change
  useEffect(() => {
    fetchReviews();
  }, [currentPage, filter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchQuery) {
        setSearchQuery(search);
        setCurrentPage(1);
        fetchReviews();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        per_page: 10,
      };
      if (filter === "pending") params.is_approved = false;
      if (filter === "approved") params.is_approved = true;

      const response = await api.get("/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReviews(response.data.data || []);
      if (response.data.meta) {
        setPaginationMeta(response.data.meta);
      }

      // Fetch counts for badges
      const pendingRes = await api.get("/admin/reviews/pending-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingCount(pendingRes.data.data?.pending_count || 0);

      // Calculate approved from total - pending
      const allRes = await api.get("/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 1 },
      });
      const total = allRes.data.meta?.total || 0;
      setApprovedCount(total - (pendingRes.data.data?.pending_count || 0));
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      await api.patch(
        `/admin/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (error) {
      alert("Không thể duyệt đánh giá");
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      await api.patch(
        `/admin/reviews/${reviewId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (error) {
      alert("Không thể từ chối đánh giá");
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (error) {
      alert("Không thể xóa đánh giá");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "pending" | "approved") => {
    setFilter(newFilter);
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <Badge variant="secondary" className="text-lg px-4 py-1">
          {pendingCount} chờ duyệt
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo sản phẩm, khách hàng, nội dung..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-500">
              {paginationMeta.total} đánh giá
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("all")}
            >
              Tất cả ({pendingCount + approvedCount})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("pending")}
              className={
                filter === "pending"
                  ? ""
                  : "text-orange-600 border-orange-300 hover:bg-orange-50"
              }
            >
              Chờ duyệt ({pendingCount})
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("approved")}
              className={
                filter === "approved"
                  ? ""
                  : "text-green-600 border-green-300 hover:bg-green-50"
              }
            >
              Đã duyệt ({approvedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {search
                  ? "Không tìm thấy đánh giá phù hợp"
                  : "Không có đánh giá nào"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {reviews.map((review) => (
              <Card key={review.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            bởi {review.customer?.full_name} •{" "}
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={review.is_approved ? "default" : "secondary"}
                        >
                          {review.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          ({review.rating}/5)
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-gray-700">"{review.comment}"</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {!review.is_approved && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(review.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(review.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {paginationMeta.last_page > 1 && (
              <Pagination
                meta={paginationMeta}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminReviews;

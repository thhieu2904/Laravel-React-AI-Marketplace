import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
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

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.is_approved;
    if (filter === "approved") return review.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: "pending", label: "Chờ duyệt" },
          { value: "approved", label: "Đã duyệt" },
          { value: "all", label: "Tất cả" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "outline"}
            onClick={() => setFilter(tab.value as typeof filter)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không có đánh giá nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={
                      review.product?.images?.[0]?.image_url ||
                      "/placeholder.jpg"
                    }
                    alt={review.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
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
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-gray-700">{review.comment}</p>
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
          ))
        )}
      </div>
    </div>
  );
}

export default AdminReviews;

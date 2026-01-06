import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import api from "@/services/api";
import type { Review } from "@/types";

export function MyReviews() {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (error) {
      alert("Không thể xóa đánh giá");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Chưa có đánh giá</h2>
        <p className="text-muted-foreground mb-6">
          Bạn chưa đánh giá sản phẩm nào
        </p>
        <Button asChild>
          <Link to="/tai-khoan/don-hang">Xem đơn hàng đã mua</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Đánh giá của tôi ({reviews.length})</h2>

      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Link to={`/san-pham/${review.product?.slug}`}>
                <img
                  src={
                    review.product?.images?.[0]?.image_url || "/placeholder.jpg"
                  }
                  alt={review.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/san-pham/${review.product?.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {review.product?.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={review.is_approved ? "default" : "secondary"}
                      >
                        {review.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {review.comment && (
                  <p className="text-sm mt-2">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MyReviews;

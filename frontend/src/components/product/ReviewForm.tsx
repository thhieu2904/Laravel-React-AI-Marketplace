import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Vui lòng chọn số sao");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/reviews", {
        product_id: productId,
        rating,
        comment,
      });
      setSuccess(true);
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.includes("already reviewed")) {
        setError("Bạn đã đánh giá sản phẩm này rồi");
      } else if (msg?.includes("purchase")) {
        setError("Bạn cần mua sản phẩm này trước khi đánh giá");
      } else {
        setError(msg || "Không thể gửi đánh giá");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-6 text-center">
          <p className="text-green-700 font-medium">
            Cảm ơn bạn đã đánh giá! Đánh giá sẽ hiển thị sau khi được duyệt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Viết đánh giá của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Đánh giá sao *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {rating > 0 &&
                  (rating === 5
                    ? "Tuyệt vời!"
                    : rating === 4
                    ? "Tốt"
                    : rating === 3
                    ? "Bình thường"
                    : rating === 2
                    ? "Chưa tốt"
                    : "Rất tệ")}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nhận xét (tùy chọn)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={3}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Gửi đánh giá
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ReviewForm;

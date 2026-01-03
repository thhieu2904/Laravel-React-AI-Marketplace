import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store";
import api from "@/services/api";
import type { Order, OrderItem } from "@/types";

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Chờ xác nhận", icon: Clock, variant: "secondary" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, variant: "default" },
  processing: { label: "Đang xử lý", icon: Package, variant: "default" },
  shipping: { label: "Đang giao", icon: Truck, variant: "default" },
  delivered: { label: "Đã giao", icon: CheckCircle, variant: "default" },
  cancelled: { label: "Đã hủy", icon: XCircle, variant: "destructive" },
};

export function OrderDetail() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<number[]>([]);

  useEffect(() => {
    if (isAuthenticated && orderCode) {
      fetchOrder();
    }
  }, [isAuthenticated, orderCode]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderCode}`);
      setOrder(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không tìm thấy đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await api.post(`/orders/${order.order_code}/cancel`);
      fetchOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const openReviewModal = (item: OrderItem) => {
    setReviewingItem(item);
    setReviewRating(0);
    setHoverRating(0);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem || reviewRating === 0) return;

    setIsSubmittingReview(true);
    try {
      await api.post("/reviews", {
        product_id: reviewingItem.product_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewedProducts([...reviewedProducts, reviewingItem.product_id]);
      setReviewModalOpen(false);
      alert("Cảm ơn bạn đã đánh giá! Đánh giá sẽ hiển thị sau khi được duyệt.");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.includes("already")) {
        alert("Bạn đã đánh giá sản phẩm này rồi");
        setReviewedProducts([...reviewedProducts, reviewingItem.product_id]);
      } else {
        alert(msg || "Không thể gửi đánh giá");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
        <Button asChild>
          <Link to="/dang-nhap">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          {error || "Không tìm thấy đơn hàng"}
        </h1>
        <Button asChild>
          <Link to="/tai-khoan/don-hang">← Quay lại</Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canReview = order.status === "delivered";

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/tai-khoan/don-hang">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách đơn hàng
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng #{order.order_code}</h1>
          <p className="text-muted-foreground">
            {formatDate(order.created_at)}
          </p>
        </div>
        <Badge variant={status.variant} className="w-fit text-sm py-1 px-3">
          <StatusIcon className="h-4 w-4 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm ({order.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item) => {
                const alreadyReviewed = reviewedProducts.includes(
                  item.product_id
                );
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <img
                      src={
                        item.product?.images?.[0]?.image_url ||
                        "/placeholder.jpg"
                      }
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/san-pham/${item.product?.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-primary font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    {canReview && (
                      <div className="self-center">
                        {alreadyReviewed ? (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã đánh giá
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewModal(item)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Đánh giá
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {order.status === "pending" && (
            <Button variant="destructive" onClick={handleCancelOrder}>
              <XCircle className="h-4 w-4 mr-2" />
              Hủy đơn hàng
            </Button>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{order.shipping_name}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{order.shipping_phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{order.shipping_address}</span>
              </div>
              {order.note && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Ghi chú:</p>
                  <p>{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(order.subtotal || order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="text-destructive">
                    -{formatPrice(order.discount_amount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Phương thức thanh toán
                </p>
                <p className="font-medium">
                  {order.payment_method === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán online"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription className="sr-only">
              Viết đánh giá cho sản phẩm bạn đã mua
            </DialogDescription>
          </DialogHeader>
          {reviewingItem && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <img
                  src={
                    reviewingItem.product?.images?.[0]?.image_url ||
                    "/placeholder.jpg"
                  }
                  alt={reviewingItem.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{reviewingItem.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(reviewingItem.unit_price)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Đánh giá sao *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || reviewRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground self-center">
                    {reviewRating > 0 &&
                      (reviewRating === 5
                        ? "Tuyệt vời!"
                        : reviewRating === 4
                        ? "Tốt"
                        : reviewRating === 3
                        ? "Bình thường"
                        : reviewRating === 2
                        ? "Chưa tốt"
                        : "Rất tệ")}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nhận xét (tùy chọn)
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0 || isSubmittingReview}
                >
                  {isSubmittingReview && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Gửi đánh giá
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetail;

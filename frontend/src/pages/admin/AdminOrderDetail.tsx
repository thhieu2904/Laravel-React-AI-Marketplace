import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  address?: string;
}

interface Order {
  id: number;
  order_code: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note?: string;
  created_at: string;
  paid_at?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  shipping: {
    label: "Đang giao",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800 border-red-300",
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Chưa thanh toán",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  failed: {
    label: "Thanh toán lỗi",
    color: "bg-red-100 text-red-800 border-red-300",
  },
};

const validTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAdminAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      await api.patch(
        `/admin/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      alert(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">
          {error || "Không tìm thấy đơn hàng"}
        </p>
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
  };
  const paymentStatus = paymentStatusConfig[order.payment_status] || {
    label: order.payment_status,
    color: "bg-gray-100 text-gray-800",
  };
  const canTransition = validTransitions[order.status]?.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng <span className="text-primary">#{order.order_code}</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Đặt lúc: {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${currentStatus.color} border px-3 py-1`}>
            {currentStatus.label}
          </Badge>
          <Badge className={`${paymentStatus.color} border px-3 py-1`}>
            {paymentStatus.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Package className="h-5 w-5 text-primary" />
                Sản phẩm đặt hàng ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                    <TableHead className="font-semibold text-center w-20">
                      SL
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Đơn giá
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Thành tiền
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.product_image ||
                              "https://placehold.co/60x60/e2e8f0/94a3b8?text=Ảnh"
                            }
                            alt={item.product_name}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                          <span className="font-medium text-gray-900">
                            {item.product_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatPrice(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {formatPrice(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {order.shipping_fee === 0
                      ? "Miễn phí"
                      : formatPrice(order.shipping_fee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          {order.note && (
            <Card>
              <CardHeader className="pb-4 border-b border-yellow-300">
                <CardTitle className="text-yellow-800">
                  📝 Ghi chú từ khách
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 italic">"{order.note}"</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Status Update - Move to top for better UX */}
          {canTransition && (
            <Card className="border-primary/30">
              <CardHeader className="pb-4 border-b border-primary/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Truck className="h-5 w-5" />
                  Cập nhật trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Select
                  value=""
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái mới..." />
                  </SelectTrigger>
                  <SelectContent>
                    {validTransitions[order.status]?.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                          {status === "confirmed" && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          {status === "shipping" && (
                            <Truck className="h-4 w-4 text-cyan-500" />
                          )}
                          {status === "delivered" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {status === "cancelled" && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {statusConfig[status]?.label || status}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5 text-blue-500" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Họ tên
                </p>
                <p className="font-semibold text-gray-900">
                  {order.customer.full_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-gray-700">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Điện thoại
                </p>
                <p className="text-gray-700">
                  {order.customer.phone || "Chưa cung cấp"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MapPin className="h-5 w-5 text-red-500" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Người nhận
                </p>
                <p className="font-semibold text-gray-900">
                  {order.shipping_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Điện thoại
                </p>
                <p className="text-gray-700">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Địa chỉ
                </p>
                <p className="text-gray-700">{order.shipping_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <CreditCard className="h-5 w-5 text-purple-500" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Phương thức
                </p>
                <p className="font-semibold text-gray-900">
                  {order.payment_method === "cod"
                    ? "Thanh toán khi nhận (COD)"
                    : "Chuyển khoản"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Trạng thái
                </p>
                <Badge className={`${paymentStatus.color} border mt-1`}>
                  {paymentStatus.label}
                </Badge>
              </div>
              {order.paid_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Thanh toán lúc
                  </p>
                  <p className="text-gray-700">{formatDate(order.paid_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;

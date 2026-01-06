import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import api from "@/services/api";
import type { Order } from "@/types";

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

export function Orders() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
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
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
        <p className="mt-4 text-muted-foreground">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Chưa có đơn hàng</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa có đơn hàng nào</p>
        <Button asChild>
          <Link to="/san-pham">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      Đơn hàng #{order.order_code}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="w-fit">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Tổng tiền:</span>{" "}
                      <span className="font-semibold text-primary">
                        {formatPrice(order.total_amount)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} sản phẩm
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tai-khoan/don-hang/${order.order_code}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;

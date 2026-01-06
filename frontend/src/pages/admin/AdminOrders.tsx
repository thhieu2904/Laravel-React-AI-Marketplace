import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle, XCircle, Truck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Pagination, type PaginationMeta } from "@/components/ui/pagination";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";
import type { Order } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-700" },
  shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

export function AdminOrders() {
  const navigate = useNavigate();
  const { token } = useAdminAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Fetch when filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchQuery) {
        setSearchQuery(search);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 10,
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOrders(response.data.data || []);
      if (response.data.meta) {
        setPaginationMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(
        `/admin/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      alert("Không thể cập nhật trạng thái");
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm mã đơn, tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {paginationMeta.total} đơn hàng
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status =
                  statusConfig[order.status] || statusConfig.pending;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-semibold text-gray-900">
                      {order.order_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.shipping_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.shipping_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                updateOrderStatus(order.id, "confirmed")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Xác nhận
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                            onClick={() =>
                              updateOrderStatus(order.id, "shipping")
                            }
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Giao hàng
                          </Button>
                        )}
                        {order.status === "shipping" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              updateOrderStatus(order.id, "delivered")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Đã giao
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Không có đơn hàng nào
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
    </div>
  );
}

export default AdminOrders;

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  todayOrders: number;
  recentOrders: Array<{
    id: number;
    order_code: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export function AdminDashboard() {
  const { token } = useAdminAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Set mock data for demo
      setStats({
        totalRevenue: 45000000,
        totalOrders: 24,
        totalProducts: 15,
        totalCustomers: 8,
        pendingOrders: 3,
        todayOrders: 2,
        recentOrders: [],
      });
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
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Doanh thu",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Đơn hàng",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Sản phẩm",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Khách hàng",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5 text-yellow-500" />
              Đơn hàng chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">
              {stats?.pendingOrders || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">đơn hàng cần xác nhận</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Đơn hàng hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {stats?.todayOrders || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">đơn hàng mới</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Đơn hàng gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recentOrders?.length ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.order_code}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p
                      className={`text-xs ${
                        order.status === "pending"
                          ? "text-yellow-600"
                          : order.status === "delivered"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Chờ xử lý"
                        : order.status === "confirmed"
                        ? "Đã xác nhận"
                        : order.status === "shipping"
                        ? "Đang giao"
                        : order.status === "delivered"
                        ? "Đã giao"
                        : order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có đơn hàng gần đây
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;

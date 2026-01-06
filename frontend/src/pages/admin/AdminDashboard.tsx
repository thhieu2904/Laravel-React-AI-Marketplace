import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  Star,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Loader2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewStats {
  orders: {
    total: number;
    today: number;
    this_month: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    this_month: number;
    last_month: number;
  };
  products: {
    total: number;
    active: number;
    out_of_stock: number;
    low_stock: number;
  };
  customers: {
    total: number;
    active: number;
    new_this_month: number;
  };
  reviews: {
    total: number;
    pending: number;
    approved: number;
  };
}

interface RecentOrder {
  id: number;
  order_code: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer: {
    id: number;
    full_name: string;
    email: string;
  } | null;
}

interface TopProduct {
  id: number;
  name: string;
  slug: string;
  total_sold: number;
  total_revenue: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

type ChartPeriod = "week" | "month" | "year";

export function AdminDashboard() {
  const { token } = useAdminAuthStore();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Chart period state
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [chartPeriod, selectedDate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        api.get("/admin/stats/overview", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/stats/recent-orders?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/stats/top-products?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data || []);
      setTopProducts(productsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      let apiUrl = "/admin/stats/revenue-chart";
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      if (chartPeriod === "week") {
        // 7 days: from (today - 6 days) to today
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        apiUrl += `?start_date=${formatApiDate(
          startDate
        )}&end_date=${formatApiDate(today)}`;
      } else if (chartPeriod === "month") {
        // Full calendar month (day 1 to last day)
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month
        apiUrl += `?start_date=${formatApiDate(
          startDate
        )}&end_date=${formatApiDate(endDate)}`;
      } else if (chartPeriod === "year") {
        // Full calendar year (Jan 1 to Dec 31)
        const startDate = new Date(year, 0, 1); // Jan 1
        const endDate = new Date(year, 11, 31); // Dec 31
        apiUrl += `?start_date=${formatApiDate(
          startDate
        )}&end_date=${formatApiDate(endDate)}`;
      }

      const chartRes = await api.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChartData(chartRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setChartLoading(false);
    }
  };

  const formatApiDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + " tỷ";
    }
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + " triệu";
    }
    return formatPrice(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChartDate = (date: string) => {
    if (chartPeriod === "year") {
      return new Date(date).toLocaleDateString("vi-VN", {
        month: "short",
      });
    }
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getChartTitle = () => {
    if (chartPeriod === "week") {
      return "Doanh thu 7 ngày qua";
    }
    if (chartPeriod === "month") {
      return `Doanh thu tháng ${
        selectedDate.getMonth() + 1
      }/${selectedDate.getFullYear()}`;
    }
    return `Doanh thu năm ${selectedDate.getFullYear()}`;
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (chartPeriod === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (chartPeriod === "year") {
      newDate.setFullYear(
        newDate.getFullYear() + (direction === "next" ? 1 : -1)
      );
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      shipping: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Doanh thu tháng này",
      value: formatCompactPrice(stats?.revenue.this_month || 0),
      subtext: `Hôm nay: ${formatCompactPrice(stats?.revenue.today || 0)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Đơn hàng",
      value: stats?.orders.this_month || 0,
      subtext: `Hôm nay: ${stats?.orders.today || 0} đơn`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Sản phẩm",
      value: stats?.products.total || 0,
      subtext: `Đang bán: ${stats?.products.active || 0}`,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Khách hàng",
      value: stats?.customers.total || 0,
      subtext: `Mới tháng này: +${stats?.customers.new_this_month || 0}`,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const alertCards = [
    {
      title: "Đơn chờ xử lý",
      value: stats?.orders.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      link: "/admin/orders?status=pending",
      urgent: (stats?.orders.pending || 0) > 0,
    },
    {
      title: "Hết hàng",
      value: stats?.products.out_of_stock || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
      link: "/admin/products",
      urgent: (stats?.products.out_of_stock || 0) > 0,
    },
    {
      title: "Sắp hết hàng",
      value: stats?.products.low_stock || 0,
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-100",
      link: "/admin/products",
      urgent: false,
    },
    {
      title: "Đánh giá chờ duyệt",
      value: stats?.reviews.pending || 0,
      icon: MessageSquare,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      link: "/admin/reviews",
      urgent: (stats?.reviews.pending || 0) > 0,
    },
  ];

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-lg rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {formatChartDate(label)}
          </p>
          <p className="text-sm text-green-600">
            Doanh thu: {formatCompactPrice(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">
            Đơn hàng: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate chart totals
  const chartTotal = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const chartOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {alertCards.map((alert) => {
          const Icon = alert.icon;
          return (
            <Link key={alert.title} to={alert.link}>
              <Card
                className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  alert.urgent ? "ring-2 ring-offset-1 ring-yellow-400" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${alert.bg}`}>
                      <Icon className={`h-5 w-5 ${alert.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {alert.value}
                      </p>
                      <p className="text-xs text-gray-500">{alert.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {getChartTitle()}
            </CardTitle>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              {/* Period Tabs */}
              <div className="flex rounded-lg border bg-gray-100 p-1">
                {(["week", "month", "year"] as ChartPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setChartPeriod(period);
                      setSelectedDate(new Date());
                    }}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      chartPeriod === period
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {period === "week"
                      ? "Tuần"
                      : period === "month"
                      ? "Tháng"
                      : "Năm"}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {chartPeriod !== "week" && (
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigatePeriod("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Hiện tại
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigatePeriod("next")}
                    disabled={
                      selectedDate.getMonth() === new Date().getMonth() &&
                      selectedDate.getFullYear() === new Date().getFullYear()
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Tổng doanh thu: </span>
              <span className="font-semibold text-green-600">
                {formatCompactPrice(chartTotal)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Tổng đơn hàng: </span>
              <span className="font-semibold text-blue-600">{chartOrders}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    interval={chartPeriod === "year" ? 30 : "preserveStartEnd"}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}M`
                        : value >= 1000
                        ? `${(value / 1000).toFixed(0)}K`
                        : value
                    }
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Chưa có dữ liệu doanh thu</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Đơn hàng gần đây
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/admin/orders"
                className="text-sm text-primary hover:underline"
              >
                Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[100px]">Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-primary">
                        <Link to={`/admin/orders/${order.id}`}>
                          #{order.order_code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer?.full_name || "Khách"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatPrice(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Chưa có đơn hàng nào
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Sản phẩm bán chạy
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/admin/products"
                className="text-sm text-primary hover:underline"
              >
                Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-center">Đã bán</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : index === 1
                                ? "bg-gray-200 text-gray-700"
                                : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="text-sm font-medium text-gray-900 hover:text-primary truncate max-w-[180px]"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {product.total_sold}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCompactPrice(product.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Chưa có dữ liệu bán hàng
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;

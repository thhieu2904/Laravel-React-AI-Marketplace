import { useState, useEffect } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, type PaginationMeta } from "@/components/ui/pagination";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";

interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  orders_count?: number;
}

interface CustomerStats {
  total: number;
  active: number;
  locked: number;
  new_this_month: number;
}

export function AdminCustomers() {
  const { token } = useAdminAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
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
    fetchCustomers();
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 10,
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.get("/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setCustomers(response.data.data || []);
      if (response.data.meta) {
        setPaginationMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/customers/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const toggleCustomerStatus = async (id: number) => {
    try {
      await api.patch(
        `/admin/customers/${id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
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
      <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Tổng khách hàng</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-gray-500">Đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.locked}</p>
                  <p className="text-sm text-gray-500">Đã khóa</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.new_this_month}</p>
                  <p className="text-sm text-gray-500">Mới tháng này</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <CardTitle className="text-lg">Danh sách khách hàng</CardTitle>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {paginationMeta.total} khách hàng
                </span>
              </div>
            </div>
            {/* Status Filter Tabs */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("all")}
              >
                Tất cả ({stats?.total || 0})
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("active")}
                className={
                  statusFilter === "active"
                    ? ""
                    : "text-green-600 border-green-300 hover:bg-green-50"
                }
              >
                Hoạt động ({stats?.active || 0})
              </Button>
              <Button
                variant={statusFilter === "locked" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange("locked")}
                className={
                  statusFilter === "locked"
                    ? ""
                    : "text-red-600 border-red-300 hover:bg-red-50"
                }
              >
                Đã khóa ({stats?.locked || 0})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead className="text-center">Đơn hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center w-28">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {customer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {customer.full_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {customer.email}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {customer.phone || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {customer.orders_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        Đã khóa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(customer.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          customer.is_active
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }
                        onClick={() => toggleCustomerStatus(customer.id)}
                      >
                        {customer.is_active ? (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Mở khóa
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy khách hàng nào
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

export default AdminCustomers;

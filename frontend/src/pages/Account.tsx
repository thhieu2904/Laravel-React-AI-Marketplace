import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Package, Star, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store";

const menuItems = [
  { path: "/tai-khoan", label: "Thông tin tài khoản", icon: User, exact: true },
  { path: "/tai-khoan/don-hang", label: "Đơn hàng của tôi", icon: Package },
  { path: "/tai-khoan/danh-gia", label: "Đánh giá của tôi", icon: Star },
  { path: "/tai-khoan/cai-dat", label: "Cài đặt", icon: Settings },
];

export function Account() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
        <Button asChild>
          <Link to="/dang-nhap">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-32">
            <CardContent className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path, item.exact)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Account;

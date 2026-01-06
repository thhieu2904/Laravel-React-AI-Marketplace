import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lock, HelpCircle, Loader2, Mail, Phone } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store";

export function Settings() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/customer/change-password", passwordForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      logout();
      navigate("/dang-nhap");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Đổi mật khẩu thất bại";
      setMessage({ type: "error", text: errorMsg });
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
        <p className="text-muted-foreground">
          Quản lý bảo mật và tài khoản của bạn
        </p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Mật khẩu mới</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">
                Xác nhận mật khẩu mới
              </Label>
              <Input
                id="new_password_confirmation"
                type="password"
                value={passwordForm.new_password_confirmation}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password_confirmation: e.target.value,
                  })
                }
                required
              />
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Đổi mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Hỗ trợ tài khoản
          </CardTitle>
          <CardDescription>
            Nếu bạn cần khóa hoặc xóa tài khoản, vui lòng liên hệ với chúng tôi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Để yêu cầu <strong>khóa tạm thời</strong> hoặc{" "}
              <strong>xóa vĩnh viễn</strong> tài khoản, vui lòng liên hệ bộ phận
              Chăm sóc Khách hàng qua:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:support@dienlanh.com"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                support@dienlanh.com
              </a>
              <a
                href="tel:19001234"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                Hotline: 1900 1234
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              * Thời gian xử lý: 1-3 ngày làm việc
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;

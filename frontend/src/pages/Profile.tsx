import { useState } from "react";
import { User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store";
import api from "@/services/api";

export function Profile() {
  const { user, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await api.put("/profile", formData);
      await fetchProfile();
      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">
                    {user?.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium">
                    {user?.address || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Chỉnh sửa thông tin
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ tên</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;

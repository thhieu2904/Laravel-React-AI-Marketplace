import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Truck, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useAuthStore } from "@/store";
import api from "@/services/api";

export function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    shipping_name: user?.full_name || "",
    shipping_phone: user?.phone || "",
    shipping_address: user?.address || "",
    note: "",
    payment_method: "cod" as "cod" | "online",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/orders", formData);
      if (response.data.success) {
        setOrderCode(response.data.data.order_code);
        setOrderSuccess(true);
        await clearCart();

        // If online payment, redirect to payment page
        if (formData.payment_method === "online") {
          const paymentRes = await api.post("/payment/create", {
            order_id: response.data.data.id,
          });
          if (paymentRes.data.success && paymentRes.data.data.payment_url) {
            window.location.href = paymentRes.data.data.payment_url;
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
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

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <Button asChild>
          <Link to="/san-pham">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mb-4">
          Mã đơn hàng:{" "}
          <span className="font-semibold text-foreground">{orderCode}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to={`/tai-khoan/don-hang/${orderCode}`}>Xem đơn hàng</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/san-pham">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_name">Họ tên người nhận *</Label>
                    <Input
                      id="shipping_name"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_phone">Số điện thoại *</Label>
                    <Input
                      id="shipping_phone"
                      name="shipping_phone"
                      type="tel"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_address">Địa chỉ giao hàng *</Label>
                  <Textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      payment_method: value as "cod" | "online",
                    })
                  }
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Thanh toán bằng tiền mặt khi nhận được hàng
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <div className="font-medium">Thanh toán online</div>
                      <div className="text-sm text-muted-foreground">
                        Chuyển khoản ngân hàng qua cổng thanh toán
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const price =
                    item.product.sale_price || item.product.original_price;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1 flex-1">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="ml-2">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Đặt hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;

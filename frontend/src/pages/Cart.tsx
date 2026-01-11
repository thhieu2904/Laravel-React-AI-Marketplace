import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useAuthStore } from "@/store";

export function Cart() {
  const {
    items,
    totalItems,
    totalPrice,
    isLoading,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
        <p className="text-muted-foreground mb-6">
          Đăng nhập để xem giỏ hàng của bạn
        </p>
        <Button asChild>
          <Link to="/dang-nhap">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">
          Chưa có sản phẩm nào trong giỏ hàng
        </p>
        <Button asChild>
          <Link to="/san-pham">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        Giỏ hàng ({totalItems} sản phẩm)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price =
              item.product.sale_price || item.product.original_price;
            const primaryImage =
              item.product.image ||
              "/placeholder.jpg";

            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/san-pham/${item.product.slug}`}>
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/san-pham/${item.product.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-primary font-bold mt-1">
                        {formatPrice(price)}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateItem(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={isLoading || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateItem(item.id, item.quantity + 1)
                            }
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {formatPrice(price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" asChild>
              <Link to="/san-pham">← Tiếp tục mua sắm</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={clearCart}
            >
              Xóa tất cả
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-32">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
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
              </div>
              <Button className="w-full mt-6" size="lg" asChild>
                <Link to="/thanh-toan">
                  Tiến hành thanh toán
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Cart;

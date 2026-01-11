import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store";

export function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isOpen,
    isLoading,
    closeCart,
    updateItem,
    removeItem,
  } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng ({totalItems} sản phẩm)
          </DialogTitle>
          <DialogDescription className="sr-only">
            Quản lý sản phẩm trong giỏ hàng của bạn
          </DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
            <Button variant="outline" onClick={closeCart} asChild>
              <Link to="/san-pham">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {items.map((item) => {
                  const price =
                    item.product?.sale_price ||
                    item.product?.original_price ||
                    0;
                  const primaryImage =
                    item.product?.image ||
                    "/placeholder.jpg";

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 py-3 border-b last:border-0"
                    >
                      <Link
                        to={`/san-pham/${item.product?.slug}`}
                        onClick={closeCart}
                      >
                        <img
                          src={primaryImage}
                          alt={item.product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-lg bg-muted"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/san-pham/${item.product?.slug}`}
                          onClick={closeCart}
                          className="font-medium text-sm line-clamp-2 hover:text-primary"
                        >
                          {item.product?.name || "Sản phẩm"}
                        </Link>
                        <p className="text-primary font-semibold mt-1">
                          {formatPrice(price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateItem(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={isLoading || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateItem(item.id, item.quantity + 1)
                              }
                              disabled={isLoading}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t bg-muted/30 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={closeCart} asChild>
                  <Link to="/gio-hang">Xem giỏ hàng</Link>
                </Button>
                <Button onClick={closeCart} asChild>
                  <Link to="/thanh-toan">
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Thanh toán
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CartDrawer;

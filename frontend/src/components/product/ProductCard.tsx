import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { useCartStore, useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/dang-nhap");
      return;
    }

    try {
      await addItem(product.id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate current price (backend accessor might not be included in list view)
  const currentPrice = product.sale_price || product.original_price;
  const hasDiscount =
    product.sale_price && product.sale_price < product.original_price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.sale_price / product.original_price) * 100)
    : 0;

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    "/placeholder.jpg";

  return (
    <Card className={cn("group overflow-hidden", className)}>
      <Link to={`/san-pham/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              -{discountPercent}%
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">
                Hết hàng
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {product.brand && (
            <p className="text-xs text-muted-foreground mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isLoading || product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

export default ProductCard;

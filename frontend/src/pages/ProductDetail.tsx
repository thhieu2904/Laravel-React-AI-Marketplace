import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product";
import { productService } from "@/services";
import type { Product, Review } from "@/types";
import { useCartStore, useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productRes = await productService.getProduct(slug);
        setProduct(productRes.data);

        if (productRes.data?.id) {
          const relatedRes = await productService.getRelatedProducts(
            productRes.data.id,
            4
          );
          setRelatedProducts(relatedRes.data || []);

          // Fetch reviews
          try {
            const reviewsRes = await fetch(
              `${import.meta.env.VITE_API_URL}/reviews/product/${
                productRes.data.id
              }`
            );
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.data || []);
          } catch {}
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/dang-nhap");
      return;
    }
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/dang-nhap");
      return;
    }
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      navigate("/thanh-toan");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Button asChild>
          <Link to="/san-pham">Xem sản phẩm khác</Link>
        </Button>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : [
          {
            id: 0,
            image_url: "/placeholder.jpg",
            is_primary: true,
            sort_order: 0,
          },
        ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/san-pham" className="hover:text-foreground">
          Sản phẩm
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center max-h-[400px]">
            <img
              src={images[selectedImage]?.image_url}
              alt={product.name}
              className="max-w-full max-h-[400px] object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.average_rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} đánh giá)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.current_price)}
            </span>
            {product.sale_price &&
              product.sale_price < product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge variant="destructive">
                    -{product.discount_percent}%
                  </Badge>
                </>
              )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          <Separator />

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Còn {product.stock_quantity} sản phẩm
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_quantity === 0}
              >
                {isAddingToCart ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : addedToCart ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                {addedToCart ? "Đã thêm!" : "Thêm vào giỏ"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleBuyNow}
                disabled={isAddingToCart || product.stock_quantity === 0}
              >
                Mua ngay
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-5 w-5 text-primary" />
              <span>Miễn phí giao hàng</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Bảo hành {product.warranty_months || 12} tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList>
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="specs">Thông số</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: product.description || "Chưa có mô tả",
            }}
          />
        </TabsContent>
        <TabsContent value="specs" className="mt-6">
          {product.specifications ? (
            <div className="max-w-xl">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b py-3">
                  <span className="w-1/3 text-muted-foreground">{key}</span>
                  <span className="w-2/3 font-medium">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Chưa có thông số</p>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <div className="max-w-2xl space-y-6">
            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold">
                  Đánh giá từ khách hàng ({reviews.length})
                </h3>
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {review.customer?.full_name}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có đánh giá nào</p>
            )}

            {/* Hint for reviewing */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                💡 Để đánh giá sản phẩm, vui lòng mua và nhận hàng, sau đó vào{" "}
                <Link
                  to="/tai-khoan/don-hang"
                  className="text-primary hover:underline"
                >
                  Đơn hàng của tôi
                </Link>{" "}
                để viết đánh giá.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService } from "@/services";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/product";

const features = [
  { icon: Truck, title: "Giao hàng miễn phí", desc: "Đơn hàng từ 5 triệu" },
  { icon: Shield, title: "Bảo hành chính hãng", desc: "Lên đến 24 tháng" },
  { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Tư vấn tận tình" },
  { icon: CreditCard, title: "Thanh toán linh hoạt", desc: "COD hoặc Online" },
];

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getFeaturedProducts(8),
          productService.getCategories(),
        ]);
        setFeaturedProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Điện lạnh chính hãng
              <br />
              Giá tốt nhất thị trường
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Chuyên cung cấp máy lạnh, tủ lạnh, máy giặt từ các thương hiệu
              hàng đầu: Daikin, Panasonic, LG, Samsung...
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/san-pham">
                  Xem sản phẩm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Liên hệ tư vấn
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
              <Link
                to="/san-pham"
                className="text-primary hover:underline text-sm"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/danh-muc/${category.slug}`}
                  className="group bg-muted rounded-lg p-6 text-center hover:bg-muted/80 transition-colors"
                >
                  <div className="text-4xl mb-3">
                    {category.slug.includes("may-lanh")
                      ? "❄️"
                      : category.slug.includes("tu-lanh")
                      ? "🧊"
                      : category.slug.includes("may-giat")
                      ? "🧺"
                      : "🔌"}
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
            <Link
              to="/san-pham"
              className="text-primary hover:underline text-sm"
            >
              Xem tất cả →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted animate-pulse rounded-lg h-[300px]"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có sản phẩm nổi bật
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

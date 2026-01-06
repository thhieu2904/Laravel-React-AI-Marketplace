import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product";
import { productService } from "@/services";
import { Product, Category as CategoryType } from "@/types";

export function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getCategoryBySlug(slug);
        setCategory(response.data);
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Danh mục không tồn tại</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Chưa có sản phẩm trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
}

export default Category;

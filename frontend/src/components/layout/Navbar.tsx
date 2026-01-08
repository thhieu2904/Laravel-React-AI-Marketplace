import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Package, Info, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import type { Category } from "@/types";

const navLinks = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/gioi-thieu", label: "Giới thiệu", icon: Info },
  { href: "/lien-he", label: "Liên hệ", icon: Phone },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<number | null>(null);

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  const handleCategoryClick = (slug: string) => {
    setIsOpen(false);
    setActiveParent(null);
    navigate(`/san-pham?category=${slug}`);
  };

  return (
    <nav className="bg-muted/50 border-b sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center gap-6">
          {/* Category Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => {
              setIsOpen(false);
              setActiveParent(null);
            }}
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
              <Package className="h-4 w-4" />
              Danh mục
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            </button>

            {/* Main Dropdown */}
            {isOpen && (
              <div className="absolute left-0 top-full pt-1 z-50">
                <div className="bg-popover border rounded-md shadow-lg min-w-[280px]">
                  {categories.length > 0 ? (
                    <ul className="py-2">
                      {categories.map((category) => (
                        <li
                          key={category.id}
                          className="relative"
                          onMouseEnter={() => setActiveParent(category.id)}
                        >
                          <button
                            onClick={() => handleCategoryClick(category.slug)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-accent transition-colors"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {category.description}
                                </div>
                              )}
                            </div>
                            {category.children &&
                              category.children.length > 0 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                              )}
                          </button>

                          {/* Submenu */}
                          {category.children &&
                            category.children.length > 0 &&
                            activeParent === category.id && (
                              <div className="absolute left-full top-0 pl-1 z-50">
                                <div className="bg-popover border rounded-md shadow-lg min-w-[240px]">
                                  <ul className="py-2">
                                    {category.children.map((child) => (
                                      <li key={child.id}>
                                        <button
                                          onClick={() =>
                                            handleCategoryClick(child.slug)
                                          }
                                          className="w-full flex items-center px-4 py-2.5 text-left hover:bg-accent transition-colors"
                                        >
                                          <div>
                                            <div className="text-sm font-medium">
                                              {child.name}
                                            </div>
                                            {child.description && (
                                              <div className="text-xs text-muted-foreground line-clamp-1">
                                                {child.description}
                                              </div>
                                            )}
                                          </div>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      Đang tải...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === link.href
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

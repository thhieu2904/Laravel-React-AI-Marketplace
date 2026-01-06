import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Home, Package, Info, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { Category } from "@/types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navLinks = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/gioi-thieu", label: "Giới thiệu", icon: Info },
  { href: "/lien-he", label: "Liên hệ", icon: Phone },
];

export function Navbar() {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="bg-muted/50 border-b sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center gap-6">
          {/* Category Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Package className="h-4 w-4 mr-2" />
                  Danh mục
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-1 p-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <li key={category.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/danh-muc/${category.slug}`}
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium">
                                {category.name}
                              </div>
                              {category.description && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {category.description}
                                </p>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-sm text-muted-foreground">
                        Đang tải...
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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

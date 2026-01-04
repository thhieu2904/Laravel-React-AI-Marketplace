import { Link } from "react-router-dom";
import { Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">⚡ Điện Lạnh TVU</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Chuyên cung cấp các sản phẩm điện lạnh chính hãng: máy lạnh, tủ
              lạnh, máy giặt với giá tốt nhất thị trường.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/san-pham"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/lien-he"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/tai-khoan/don-hang"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold text-lg mb-4">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  126 Nguyễn Thiện Thành, Phường 5, Trà Vinh
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:0123456789"
                  className="text-muted-foreground hover:text-foreground"
                >
                  0123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:contact@dienlanhtvu.vn"
                  className="text-muted-foreground hover:text-foreground"
                >
                  contact@dienlanhtvu.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Điện Lạnh. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

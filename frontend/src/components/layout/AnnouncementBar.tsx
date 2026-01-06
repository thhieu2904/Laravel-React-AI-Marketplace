import { Phone, Mail } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a
            href="tel:19001234"
            className="flex items-center gap-1 hover:opacity-80"
          >
            <Phone className="h-3 w-3" />
            <span>Hotline: 1900 1234</span>
          </a>
          <a
            href="mailto:contact@dienlanh.com"
            className="hidden sm:flex items-center gap-1 hover:opacity-80"
          >
            <Mail className="h-3 w-3" />
            <span>contact@dienlanh.com</span>
          </a>
        </div>
        <div className="hidden md:block">
          <span>🎉 Miễn phí giao hàng đơn từ 5 triệu đồng</span>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;

import { Outlet } from "react-router-dom";
import {
  AnnouncementBar,
  Header,
  Navbar,
  Footer,
  ChatWidget,
} from "@/components/layout";
import { CartDrawer } from "@/components/cart";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <ChatWidget />
      <CartDrawer />
    </div>
  );
}

export default PublicLayout;

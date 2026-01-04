import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useSessionStore } from "@/store/sessionStore";
import { useAuthStore } from "@/store";

export function SessionExpiredModal() {
  const navigate = useNavigate();
  const { isSessionExpired, setSessionExpired } = useSessionStore();
  const { logout } = useAuthStore();

  const handleLogin = () => {
    logout();
    setSessionExpired(false);
    navigate("/dang-nhap");
  };

  return (
    <Dialog open={isSessionExpired} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Phiên đăng nhập hết hạn</DialogTitle>
              <DialogDescription>
                Vui lòng đăng nhập lại để tiếp tục sử dụng.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            Đăng nhập lại
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SessionExpiredModal;

import { Phone, Mail, MapPin, Clock, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Nguyễn Thanh Hiếu",
    role: "Team Leader",
    studentId: "110122221",
    avatar: null,
  },
  {
    name: "Phạm Hoàng Kha",
    role: "Developer",
    studentId: "110122008",
    avatar: null,
  },
  {
    name: "Nguyễn Trí Cường",
    role: "Developer",
    studentId: "110122041",
    avatar: null,
  },
];

const contactInfo = [
  {
    icon: MapPin,
    title: "Địa chỉ",
    content: "126 Nguyễn Thiện Thành, Phường 5, Trà Vinh, 940000",
  },
  {
    icon: Phone,
    title: "Điện thoại",
    content: "0123 456 789",
  },
  {
    icon: Mail,
    title: "Email",
    content: "contact@dienlanhtvu.vn",
  },
  {
    icon: Clock,
    title: "Giờ làm việc",
    content: "Thứ 2 - Thứ 7: 8:00 - 18:00",
  },
];

export function Contact() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Đại học Trà Vinh - Dự án môn học
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Nhóm thực hiện
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Sinh viên Đại học Trà Vinh
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className={`bg-white ${
                  index === 0 ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {member.name.split(" ").slice(-1)[0].charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-1">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    MSSV: {member.studentId}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info & Map */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Thông tin liên hệ</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.title}</h3>
                      <p className="text-muted-foreground">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* GitHub Link */}
              <div className="mt-8 pt-8 border-t">
                <a
                  href="https://github.com/thhieu2904/Laravel-React-AI-Marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span>Xem source code trên GitHub</span>
                </a>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Vị trí</h2>
              <div className="rounded-lg overflow-hidden border bg-white h-[400px]">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.34494781494142%2C9.921720924056877%2C106.34894371032716%2C9.924720924056877&layer=mapnik&marker=9.923220%2C106.346945"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Vị trí cửa hàng"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                📍 Đại học Trà Vinh - 126 Nguyễn Thiện Thành, Phường 5, Trà Vinh
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

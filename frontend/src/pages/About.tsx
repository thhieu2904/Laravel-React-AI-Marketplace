import { Store, Users, Award, Clock, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Award,
    title: "Chất lượng đảm bảo",
    description:
      "Cam kết 100% sản phẩm chính hãng từ các thương hiệu uy tín hàng đầu",
  },
  {
    icon: Clock,
    title: "Bảo hành dài hạn",
    description: "Chế độ bảo hành lên đến 24 tháng, hỗ trợ kỹ thuật trọn đời",
  },
  {
    icon: Users,
    title: "Đội ngũ chuyên nghiệp",
    description: "Nhân viên được đào tạo bài bản, tư vấn tận tâm",
  },
  {
    icon: Store,
    title: "Giá cả cạnh tranh",
    description: "Cam kết giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn",
  },
];

export function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về chúng tôi</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Đơn vị phân phối điện lạnh uy tín hàng đầu tại Việt Nam
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Điện Lạnh TVU</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Được thành lập với sứ mệnh mang đến những sản phẩm điện lạnh chất
              lượng cao với giá cả hợp lý cho người tiêu dùng Việt Nam. Chúng
              tôi tự hào là đối tác chính thức của các thương hiệu hàng đầu như
              Daikin, Panasonic, LG, Samsung, Toshiba.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Với đội ngũ nhân viên được đào tạo chuyên nghiệp và hệ thống kỹ
              thuật hiện đại, chúng tôi cam kết mang đến trải nghiệm mua sắm tốt
              nhất cùng dịch vụ hậu mãi chu đáo cho khách hàng.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Giá trị cốt lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Liên hệ với chúng tôi</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>126 Nguyễn Thiện Thành, Phường 5, Trà Vinh</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <span>0123 456 789</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>contact@dienlanhtvu.vn</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

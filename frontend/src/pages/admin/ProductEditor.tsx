import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
  Upload,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface Specification {
  key: string;
  value: string;
}

// Cloudinary upload function
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary chưa được cấu hình. Vui lòng kiểm tra file .env"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Upload thất bại. Vui lòng kiểm tra cấu hình Cloudinary.");
  }

  const data = await response.json();
  return data.secure_url;
};

export function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuthStore();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadingEditorImage, setUploadingEditorImage] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    brand: "",
    original_price: "",
    sale_price: "",
    stock_quantity: "",
    short_description: "",
    is_featured: false,
    is_active: true,
  });

  const [productImages, setProductImages] = useState<
    Array<{ url: string; is_primary: boolean }>
  >([]);
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: "", value: "" },
  ]);

  // Force re-render for tooltips and toolbar state
  const [, forceUpdate] = useState(0);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Placeholder.configure({
        placeholder: "Viết mô tả chi tiết sản phẩm ở đây...",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onTransaction: () => {
      forceUpdate((n) => n + 1);
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/public/categories");
      const data = response.data.data || [];
      setCategories(data);

      // If editing, determine parent category from category_id
      if (formData.category_id) {
        const catId = parseInt(formData.category_id);
        // Check if it's a root category
        const rootCat = data.find((c: Category) => c.id === catId);
        if (rootCat) {
          // It's a root category without meaningful children, keep as is
          setSelectedParentId(String(catId));
        } else {
          // It's a child, find the parent
          for (const parent of data) {
            const child = parent.children?.find(
              (c: Category) => c.id === catId
            );
            if (child) {
              setSelectedParentId(String(parent.id));
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const product = response.data.data;

      setFormData({
        name: product.name,
        slug: product.slug,
        category_id: String(product.category_id),
        brand: product.brand || "",
        original_price: String(product.original_price),
        sale_price: product.sale_price ? String(product.sale_price) : "",
        stock_quantity: String(product.stock_quantity),
        short_description: product.short_description || "",
        is_featured: product.is_featured,
        is_active: product.is_active,
      });

      // Determine parent category from category_id
      const catId = product.category_id;
      // Fetch fresh categories to find parent
      const catResponse = await api.get("/public/categories");
      const allCategories = catResponse.data.data || [];
      setCategories(allCategories);

      // Check if it's a root category
      const rootCat = allCategories.find((c: Category) => c.id === catId);
      if (rootCat) {
        setSelectedParentId(String(catId));
      } else {
        // It's a child, find the parent
        for (const parent of allCategories) {
          const child = parent.children?.find((c: Category) => c.id === catId);
          if (child) {
            setSelectedParentId(String(parent.id));
            break;
          }
        }
      }

      if (product.images) {
        setProductImages(
          product.images.map((img: any) => ({
            url: img.image_url,
            is_primary: img.is_primary,
          }))
        );
      }

      if (product.specifications) {
        const specs = Object.entries(product.specifications).map(
          ([key, value]) => ({
            key,
            value: String(value),
          })
        );
        setSpecifications(specs.length > 0 ? specs : [{ key: "", value: "" }]);
      }

      if (product.description && editor) {
        editor.commands.setContent(product.description);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      alert("Không thể tải thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        setProductImages((prev) => [
          ...prev,
          { url, is_primary: prev.length === 0 },
        ]);
      }
    } catch (error) {
      alert("Upload ảnh thất bại");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setProductImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const insertImageToEditor = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  };

  const setEditorLink = () => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setLinkDialogOpen(false);
    } else if (editor) {
      editor.chain().focus().unsetLink().run();
      setLinkDialogOpen(false);
    }
  };

  const handleEditorImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploadingEditorImage(true);
    try {
      const url = await uploadToCloudinary(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      alert("Upload ảnh thất bại");
    } finally {
      setUploadingEditorImage(false);
      if (editorImageInputRef.current) {
        editorImageInputRef.current.value = "";
      }
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key.trim()) {
          acc[spec.key.trim()] = spec.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        original_price: parseFloat(formData.original_price),
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        stock_quantity: parseInt(formData.stock_quantity),
        description: editor?.getHTML() || "",
        specifications: specsObject,
        images: productImages.map((img, index) => ({
          url: img.url,
          is_primary: img.is_primary,
          sort_order: index,
        })),
      };

      if (isEditing) {
        await api.put(`/admin/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/admin/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate("/admin/products");
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: isEditing
                        ? formData.slug
                        : generateSlug(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help border-b border-dashed">
                        (?)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Slug là phần cuối của URL, ví dụ:{" "}
                        <code>/san-pham/may-lanh-daikin-1hp</code>
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Được tự động tạo từ tên sản phẩm
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Mô tả ngắn</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  rows={2}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rich Description */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Toolbar */}
              <div className="border rounded-t-lg bg-gray-50 p-1.5 flex flex-wrap gap-0.5">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("bold")
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="In đậm"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("italic")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="In nghiêng"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("underline")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Gạch dưới"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("strike")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Gạch ngang"
                >
                  <Strikethrough className="h-4 w-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("heading", { level: 1 })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Tiêu đề 1"
                >
                  <Heading1 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("heading", { level: 2 })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Tiêu đề 2"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("bulletList")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Danh sách"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("orderedList")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Đánh số"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("blockquote")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Trích dẫn"
                >
                  <Quote className="h-4 w-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("left").run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive({ textAlign: "left" })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Căn trái"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("center").run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive({ textAlign: "center" })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Căn giữa"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("right").run()
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive({ textAlign: "right" })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Căn phải"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => setLinkDialogOpen(true)}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors
                    ${
                      editor?.isActive("link")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  title="Thêm link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setHorizontalRule().run()
                  }
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Đường kẻ ngang"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setImageDialogOpen(true)}
                      className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors"
                      title="Chèn ảnh từ URL"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Chèn ảnh từ URL</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
                      <input
                        ref={editorImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditorImageUpload}
                        className="hidden"
                        disabled={uploadingEditorImage}
                      />
                      {uploadingEditorImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>Upload ảnh từ máy</TooltipContent>
                </Tooltip>
              </div>
              {/* Editor */}
              <div className="border border-t-0 rounded-b-lg bg-white">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thông số kỹ thuật</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Tên (VD: Công suất)"
                    value={spec.key}
                    onChange={(e) =>
                      updateSpecification(index, "key", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Giá trị (VD: 1.5 HP)"
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(index, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Category & Price */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Phân loại & Giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parent Category */}
              <div className="space-y-2">
                <Label>Danh mục chính *</Label>
                <Select
                  value={selectedParentId}
                  onValueChange={(value) => {
                    setSelectedParentId(value);
                    // Reset child selection
                    const parent = categories.find(
                      (c) => String(c.id) === value
                    );
                    if (
                      parent &&
                      (!parent.children || parent.children.length === 0)
                    ) {
                      // No children, use parent directly
                      setFormData({ ...formData, category_id: value });
                    } else {
                      // Has children, wait for child selection
                      setFormData({ ...formData, category_id: "" });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục chính" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Child Category (if parent has children) */}
              {(() => {
                const parentCat = categories.find(
                  (c) => String(c.id) === selectedParentId
                );
                if (parentCat?.children && parentCat.children.length > 0) {
                  return (
                    <div className="space-y-2">
                      <Label>Danh mục con *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục con" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentCat.children.map((child) => (
                            <SelectItem key={child.id} value={String(child.id)}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <Label htmlFor="brand">Thương hiệu</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Giá gốc *</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData({ ...formData, original_price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Giá khuyến mãi</Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_price: e.target.value })
                  }
                />
                {/* Discount Preview */}
                {formData.original_price &&
                  formData.sale_price &&
                  parseFloat(formData.sale_price) <
                    parseFloat(formData.original_price) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                        -
                        {Math.round(
                          ((parseFloat(formData.original_price) -
                            parseFloat(formData.sale_price)) /
                            parseFloat(formData.original_price)) *
                            100
                        )}
                        %
                      </span>
                      <span className="text-muted-foreground">
                        Tiết kiệm{" "}
                        {new Intl.NumberFormat("vi-VN").format(
                          parseFloat(formData.original_price) -
                            parseFloat(formData.sale_price)
                        )}
                        đ
                      </span>
                    </div>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Số lượng kho *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_featured: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Nổi bật</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Hiển thị</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage || productImages.length >= 6}
                />
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-sm text-gray-500 mt-2">
                  {productImages.length >= 6
                    ? "Đã đủ 6 ảnh"
                    : `Click để upload (${productImages.length}/6 ảnh)`}
                </span>
              </label>

              {/* Preview */}
              <div className="grid grid-cols-2 gap-2">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      img.is_primary ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!img.is_primary && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setPrimaryImage(index)}
                        >
                          Chính
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {img.is_primary && (
                      <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                        Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Image URL Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chèn hình ảnh</DialogTitle>
            <DialogDescription>
              Nhập URL hình ảnh từ Cloudinary hoặc nguồn khác
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL hình ảnh</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
            {imageUrl && (
              <div className="border rounded p-2">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-32 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={insertImageToEditor} disabled={!imageUrl}>
              Chèn ảnh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm liên kết</DialogTitle>
            <DialogDescription>
              Nhập URL để tạo hyperlink cho văn bản đã chọn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (editor) editor.chain().focus().unsetLink().run();
                setLinkDialogOpen(false);
              }}
            >
              Xóa link
            </Button>
            <Button onClick={setEditorLink} disabled={!linkUrl}>
              Thêm link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductEditor;

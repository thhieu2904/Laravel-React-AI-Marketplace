import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import api from "@/services/api";

// Cloudinary Config from env
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: number | null;
  products_count?: number;
  children?: Category[];
  parent?: { id: number; name: string };
}

export function AdminCategories() {
  const { token } = useAdminAuthStore();
  const [categories, setCategories] = useState<Category[]>([]); // Tree structure
  const [flatCategories, setFlatCategories] = useState<Category[]>([]); // Flat for select/search
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    sort_order: 0,
    is_active: true,
    parent_id: "0", // "0" means no parent (root)
  });
  const [isSaving, setIsSaving] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<number>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || [];
      setCategories(data);

      // Flatten recursively for options and search
      const flatten = (cats: Category[]): Category[] => {
        let result: Category[] = [];
        cats.forEach((c) => {
          result.push(c);
          if (c.children && c.children.length > 0) {
            result = [...result, ...flatten(c.children)];
          }
        });
        return result;
      };
      setFlatCategories(flatten(data));

      // Expand all by default
      const allIds = new Set<number>(
        data
          .filter((c: Category) => c.children?.length)
          .map((c: Category) => c.id)
      );
      setExpandedParents(allIds);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
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

  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi upload ảnh. Vui lòng kiểm tra lại cấu hình Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      sort_order: 0,
      is_active: true,
      parent_id: "0",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      sort_order: category.sort_order,
      is_active: category.is_active,
      parent_id: category.parent_id?.toString() || "0",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      parent_id:
        formData.parent_id === "0" ? null : parseInt(formData.parent_id),
    };

    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/admin/categories", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      await api.put(
        `/admin/categories/${category.id}`,
        { is_active: !category.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedParents(newExpanded);
  };

  // Filter for search
  const displayedCategories = search
    ? flatCategories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories; // Tree if no search

  // Render logic
  const renderRow = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedParents.has(category.id);
    const indent = level * 24; // px

    return (
      <React.Fragment key={category.id}>
        <TableRow className={level === 0 ? "bg-white" : "bg-slate-50/50"}>
          <TableCell>
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indent}px` }}
            >
              {/* Expand Toggle */}
              {hasChildren && !search ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" /> // spacer
              )}

              {/* Icon */}
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-8 h-8 object-cover rounded"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}

              <div className="flex flex-col">
                <span
                  className={`text-gray-900 ${
                    level === 0 ? "font-semibold" : "font-medium"
                  }`}
                >
                  {category.name}
                </span>
                {level > 0 && category.parent && !search && (
                  <span className="text-xs text-gray-400">
                    thuộc {category.parent.name}
                  </span>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell className="font-mono text-xs text-gray-500">
            {category.slug}
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {category.products_count || 0}
            </span>
          </TableCell>
          <TableCell className="text-center">{category.sort_order}</TableCell>
          <TableCell>
            <button
              onClick={() => toggleCategoryStatus(category)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category.is_active
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {category.is_active ? (
                <>
                  <Eye className="h-3.5 w-3.5" /> Hiện
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Ẩn
                </>
              )}
            </button>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => openEditDialog(category)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {/* Render children if expanded and not searching */}
        {hasChildren &&
          isExpanded &&
          !search &&
          category.children!.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <Button onClick={openAddDialog} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4 border-b bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              Danh sách danh mục
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[400px]">Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-center">Thứ tự</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedCategories.length > 0 ? (
                displayedCategories.map((cat) => renderRow(cat))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    Không tìm thấy danh mục nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin danh mục bên dưới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Danh mục cha</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(val) =>
                    setFormData({ ...formData, parent_id: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục cha" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem
                      value="0"
                      className="font-semibold text-gray-600"
                    >
                      -- Là danh mục gốc --
                    </SelectItem>
                    {flatCategories
                      .filter(
                        (c) =>
                          c.id !== editingCategory?.id && c.parent_id === null
                      ) // Only show roots as potential parents usually, or filter out self
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Danh mục con sẽ hiển thị bên trong danh mục cha.
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingCategory
                        ? formData.slug
                        : generateSlug(e.target.value),
                    });
                  }}
                  required
                  placeholder="Ví dụ: Máy lạnh"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Icon / Hình ảnh</Label>
                <div className="flex items-start gap-4">
                  {formData.image ? (
                    <div className="relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          uploadToCloudinary(e.target.files[0]);
                      }}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải
                        lên Cloudinary...
                      </div>
                    )}
                    <Input
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Hoặc nhập URL ảnh..."
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2 pt-8">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Hiển thị danh mục
                  </Label>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving || uploading}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCategories;

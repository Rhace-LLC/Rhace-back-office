import React, { useState, ChangeEvent, FormEvent } from "react";
import { CategoryData, updateCategoryDataById } from "@/store/category.slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Edit3, XCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateCategory } from "@/api-services/menu.service";
import { parseError } from "@/api-services/utils/parseError";
import { useDispatch } from "react-redux";

interface ViewCategoryProps {
  data: CategoryData;
}

const ViewCategory: React.FC<ViewCategoryProps> = ({ data }) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: data.name,
    description: data.description || "",
    image: data.image_url || "",
    imageFile: null as File | null,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.imageFile || "");

    try {
      setLoading(true);

      const res = await updateCategory(
        auth.restaurants[0].id,
        String(data.id),
        formData,
        auth.token
      );

      dispatch(updateCategoryDataById(res));

      toast.success("Category updated successfully!");
    } catch (error: any) {
      const errorMessage = parseError(error) || "Failed to update category.";
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 pt-7">
      {!isEditing ? (
        <>
          <div className="grid grid-cols-1 gap-6 rounded-2xl border-line bg-surface">
            {/* Image */}
            <div className="col-span-1">
              {data.image_url ? (
                <img
                  src={data.image_url}
                  alt={data.name}
                  className="h-56 w-full rounded-3xl border border-line object-cover"
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-3xl border-2 border-dashed bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 font-medium text-ink-secondary">
                  No Image Available
                </div>
              )}
            </div>

            {/* Details */}
            <div className="col-span-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Category Name</span>
                  <span className="font-semibold text-ink">
                    {data.name}
                  </span>
                </div>

                <div className="mb-2 flex items-start justify-between">
                  <span className="text-sm text-ink-muted">Description</span>
                  <span className="max-w-[60%] text-right text-ink">
                    {data.description || "No description provided"}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-ink-muted">
                  <span>updated</span>
                  <span>{new Date(data.updated_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-ink-muted">
                  <span>Updated</span>
                  <span>{new Date(data.updated_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end pt-5 pb-10">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-inset py-2 text-ink-secondary transition-colors hover:bg-inset hover:text-ink"
                >
                  <Edit3 size={16} className="text-ink-muted" />
                  Edit Category
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl bg-surface"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Cute Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label>
            <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line p-3 transition-colors duration-200 hover:border-blue-400">
              <input
                id="image"
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleImageChange}
              />
              {form.image ? (
                <div className="w-full space-y-2">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-56 w-full rounded-2xl border border-line object-cover"
                  />

                  <button
                    type="button"
                    className="w-full rounded-2xl border border-line bg-inset py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-inset hover:text-ink"
                  >
                    Click to Change
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-ink-muted">
                  <ImagePlus size={36} className="mb-2 text-blue-400" />
                  <span className="text-sm">Click to upload an image</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 pb-15">
            <Button
              type="button"
              variant="outline"
              className="flex cursor-pointer items-center gap-2 text-ink-secondary"
              onClick={() => setIsEditing(false)}
            >
              <XCircle size={16} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save size={16} />
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ViewCategory;

"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { createCategory } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { useDispatch } from "react-redux";
import { appendCategoryToPage } from "@/store/category.slice";

interface AddCategoryFormProps {
  onSubmit: (formData: FormData) => void;
}

export default function AddCategoryForm({ onSubmit }: AddCategoryFormProps) {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      setLoading(true);

      const res = await createCategory(
        auth.restaurants[0].id,
        formData,
        auth.token
      );
      console.log("Response:", res);
      dispatch(appendCategoryToPage({ key: "1", item: res }));

      toast.success("Category created successfully!");
      onSubmit(formData);
    } catch (error: any) {
      const errorMessage = parseError(error) || "Failed to create category.";
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Desserts"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this category"
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label>Category Image</Label>
        {previewUrl ? (
          <div className="relative mt-2 w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-48 w-full rounded-lg border object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="imageUpload"
            className="mt-2 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:bg-gray-50"
          >
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Click to upload category image
            </p>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
      <div className="py-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          {loading ? "Saving Category... Please Wait" : "Save Category"}
        </Button>
      </div>
    </form>
  );
}

import ProductImageUpload from "@/components/admin-view/image-upload";
import SingleImageUpload from "@/components/admin-view/single-image-upload";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus, X } from "lucide-react";
import {
  addCategory,
  fetchAllCategories,
  updateCategory,
  deleteCategory,
} from "@/store/admin/category-brand-slice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

function AdminCategories() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    isActive: true,
  });

  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector(
    (state) => state.adminCategoryBrand
  );
  const { toast } = useToast();

  // Handle form submission
  function handleSubmit() {
    if (!formData.id || !formData.label) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!editMode && (!uploadedImageUrl || uploadedImageUrl.trim() === "")) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    if (imageLoadingState) {
      toast({
        title: "Please wait",
        description: "Image is still uploading...",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("id", formData.id);
    submitData.append("label", formData.label);
    submitData.append("isActive", formData.isActive);

    if (imageFile) {
      submitData.append("image", imageFile);
    }

    if (editMode && currentCategory) {
      dispatch(updateCategory({ id: currentCategory._id, formData: submitData }))
        .then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllCategories());
            resetForm();
            toast({
              title: "Success",
              description: "Category updated successfully",
            });
          } else {
            toast({
              title: "Error",
              description: data?.payload?.message || "Failed to update category",
              variant: "destructive",
            });
          }
        });
    } else {
      dispatch(addCategory(submitData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllCategories());
          resetForm();
          toast({
            title: "Success",
            description: "Category added successfully",
          });
        } else {
          toast({
            title: "Error",
            description: data?.payload?.message || "Failed to add category",
            variant: "destructive",
          });
        }
      });
    }
  }

  // Handle edit
  function handleEdit(category) {
    setEditMode(true);
    setCurrentCategory(category);
    setFormData({
      id: category.id,
      label: category.label,
      isActive: category.isActive,
    });
    setUploadedImageUrl(category.image);
    setOpenDialog(true);
  }

  // Handle delete
  async function handleDelete(categoryId) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    dispatch(deleteCategory(categoryId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllCategories());
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data?.payload?.message || "Failed to delete category",
          variant: "destructive",
        });
      }
    });
  }

  // Reset form
  function resetForm() {
    setFormData({
      id: "",
      label: "",
      isActive: true,
    });
    setImageFile(null);
    setUploadedImageUrl("");
    setOpenDialog(false);
    setEditMode(false);
    setCurrentCategory(null);
  }

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category._id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="relative mb-3">
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-32 object-contain rounded"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(category._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{category.label}</h3>
                <p className="text-sm text-gray-500">ID: {category.id}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      category.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No categories found. Add your first category!
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Category ID *</Label>
              <Input
                id="id"
                placeholder="e.g., men, women, kids"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                disabled={editMode}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lowercase, no spaces (used in URLs)
              </p>
            </div>

            <div>
              <Label htmlFor="label">Category Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Men, Women, Kids"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div>
              <Label>Category Image *</Label>
              <SingleImageUpload
                imageFile={imageFile}
                setImageFile={setImageFile}
                uploadedImageUrl={uploadedImageUrl}
                setUploadedImageUrl={setUploadedImageUrl}
                setImageLoadingState={setImageLoadingState}
                imageLoadingState={imageLoadingState}
                isCustomStyling={true}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={imageLoadingState || isLoading}
              >
                {imageLoadingState
                  ? "Uploading..."
                  : editMode
                  ? "Update Category"
                  : "Add Category"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCategories;
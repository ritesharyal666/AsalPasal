import ProductImageUpload from "@/components/admin-view/image-upload";
import SingleImageUpload from "@/components/admin-view/single-image-upload";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  addBrand,
  fetchAllBrands,
  updateBrand,
  deleteBrand,
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

function AdminBrands() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    isActive: true,
  });

  const dispatch = useDispatch();
  const { brands, isLoading } = useSelector((state) => state.adminCategoryBrand);
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

    if (editMode && currentBrand) {
      dispatch(updateBrand({ id: currentBrand._id, formData: submitData })).then(
        (data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllBrands());
            resetForm();
            toast({
              title: "Success",
              description: "Brand updated successfully",
            });
          } else {
            toast({
              title: "Error",
              description: data?.payload?.message || "Failed to update brand",
              variant: "destructive",
            });
          }
        }
      );
    } else {
      dispatch(addBrand(submitData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllBrands());
          resetForm();
          toast({
            title: "Success",
            description: "Brand added successfully",
          });
        } else {
          toast({
            title: "Error",
            description: data?.payload?.message || "Failed to add brand",
            variant: "destructive",
          });
        }
      });
    }
  }

  // Handle edit
  function handleEdit(brand) {
    setEditMode(true);
    setCurrentBrand(brand);
    setFormData({
      id: brand.id,
      label: brand.label,
      isActive: brand.isActive,
    });
    setUploadedImageUrl(brand.image);
    setOpenDialog(true);
  }

  // Handle delete
  async function handleDelete(brandId) {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    dispatch(deleteBrand(brandId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllBrands());
        toast({
          title: "Success",
          description: "Brand deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data?.payload?.message || "Failed to delete brand",
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
    setCurrentBrand(null);
  }

  useEffect(() => {
    dispatch(fetchAllBrands());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brands</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <div
              key={brand._id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="relative mb-3">
                <img
                  src={brand.image}
                  alt={brand.label}
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
                    onClick={() => handleEdit(brand)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(brand._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{brand.label}</h3>
                <p className="text-sm text-gray-500">ID: {brand.id}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      brand.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No brands found. Add your first brand!
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Brand ID *</Label>
              <Input
                id="id"
                placeholder="e.g., nike, adidas, puma"
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
              <Label htmlFor="label">Brand Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Nike, Adidas, Puma"
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
              <Label>Brand Logo *</Label>
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
                  ? "Update Brand"
                  : "Add Brand"}
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

export default AdminBrands;
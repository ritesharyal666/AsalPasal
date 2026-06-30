import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { fetchAllCategories, fetchAllBrands } from "@/store/admin/category-brand-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  costPrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [formControls, setFormControls] = useState(addProductFormElements);
  const [filters, setFilters] = useState({});

  const { productList, pagination } = useSelector((state) => state.adminProducts);
  const { categories, brands } = useSelector((state) => state.adminCategoryBrand);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // SYNC: Keep formData.images in sync with uploadedImageUrls so validation passes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      images: uploadedImageUrls,
    }));
  }, [uploadedImageUrls]);

  // Update form controls with dynamic category/brand options
  useEffect(() => {
    const updatedControls = addProductFormElements.map(control => {
      if (control.name === 'category') {
        return {
          ...control,
          options: categories.map(cat => ({ id: cat._id, label: cat.label }))
        };
      }
      if (control.name === 'brand') {
        return {
          ...control,
          options: brands.map(br => ({ id: br._id, label: br.label }))
        };
      }
      return control;
    });
    setFormControls(updatedControls);
  }, [categories, brands]);

  useEffect(() => {
    dispatch(fetchAllProducts({ filterParams: filters }));
  }, [dispatch, filters]);

  function onSubmit(event) {
    event.preventDefault();

    const finalData = {
      ...formData,
      images: uploadedImageUrls,
    };

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: finalData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          resetForm();
          toast({ title: "Product updated successfully" });
        }
      });
    } else {
      dispatch(addNewProduct(finalData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          resetForm();
          toast({ title: "Product added successfully" });
        }
      });
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setCurrentEditedId(null);
    setImageFiles([]);
    setUploadedImageUrls([]);
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ title: "Product deleted" });
      }
    });
  }

  function isFormValid() {
    // Validation logic
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => {
        if (key === "images") {
          return formData[key] && formData[key].length > 0;
        }
        return formData[key] !== "" && formData[key] !== null && formData[key] !== undefined;
      })
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllCategories());
    dispatch(fetchAllBrands());
  }, [dispatch]);

  useEffect(() => {
    if (currentEditedId !== null && productList.length > 0) {
      const currentProduct = productList.find((product) => product._id === currentEditedId);
      if (currentProduct) {
        const existingImages = currentProduct.images || [];
        setUploadedImageUrls(existingImages);
        setFormData({
          ...currentProduct,
          images: existingImages,
        });
      }
    }
  }, [currentEditedId, productList]);

  const getFormElements = () => {
    const categoryOptions = categories
      .filter((c) => c.isActive)
      .map((c) => ({ id: c._id, label: c.label }));

    const brandOptions = brands
      .filter((b) => b.isActive)
      .map((b) => ({ id: b._id, label: b.label }));

    return addProductFormElements.map((element) => {
      if (element.name === "category") return { ...element, options: categoryOptions };
      if (element.name === "brand") return { ...element, options: brandOptions };
      return element;
    });
  };

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-4">
        <Select
          value={filters.category || "none"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "none" ? undefined : value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.isActive).map(cat => (
              <SelectItem key={cat._id} value={cat._id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.brand || "none"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value === "none" ? undefined : value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.filter(br => br.isActive).map(br => (
              <SelectItem key={br._id} value={br._id}>{br.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Product Display Section */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0 ? (
          productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No products found. Add your first product!
          </div>
        )}
      </div>

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCreateProductsDialog(false);
            resetForm();
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />

          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit Product" : "Add Product"}
              formControls={getFormElements()}
              isBtnDisabled={!isFormValid() || imageLoadingState}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
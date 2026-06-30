import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFiles = [], // Default to empty array
  setImageFiles,
  imageLoadingState,
  uploadedImageUrls = [], // Default to empty array
  setUploadedImageUrls,
  setImageLoadingState,
  isEditMode = false,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      setImageFiles?.((prev) => [...(prev || []), ...selectedFiles]);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setImageFiles?.((prev) => [...(prev || []), ...droppedFiles]);
    }
  }

  function handleRemoveImage(index) {
    setImageFiles?.((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls?.((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImagesToServer() {
    if (!setImageLoadingState) return;
    setImageLoadingState(true);

    // Filter to only upload new Files (not already uploaded URLs)
    const uploadPromises = (imageFiles || [])
      .filter((file) => file instanceof File)
      .map(async (file) => {
        const data = new FormData();
        data.append("my-file", file);
        const response = await axios.post(
          "http://localhost:5000/api/admin/products/upload-image",
          data
        );
        return response.data.result.url;
      });

    try {
      const urls = await Promise.all(uploadPromises);
      setUploadedImageUrls?.((prev) => [...(prev || []), ...urls]);
      setImageLoadingState(false);
    } catch (error) {
      console.error("Error uploading images:", error);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    const filesToUpload = (imageFiles || []).filter(f => f instanceof File).length;
    if (filesToUpload > 0) {
      uploadImagesToServer();
    }
  }, [imageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">Upload Images</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${isEditMode ? "opacity-60" : ""} border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          multiple
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />
        {!(imageFiles?.length) && !(uploadedImageUrls?.length) ? (
          <Label
            htmlFor="image-upload"
            className={`${isEditMode ? "cursor-not-allowed" : "cursor-pointer"} flex flex-col items-center justify-center h-32`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload multiple images</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="space-y-2">
            {uploadedImageUrls.map((url, index) => (
              <div key={`uploaded-${index}`} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center">
                  <img src={url} alt={`Uploaded ${index + 1}`} className="w-6 h-6 mr-2 object-cover" />
                  <span className="text-sm font-medium truncate w-[200px]">
                    Uploaded Image {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setUploadedImageUrls?.((prev) => prev.filter((_, i) => i !== index))}
                  disabled={isEditMode}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {imageFiles.map((file, index) => (
              <div key={`file-${index}`} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center">
                  <FileIcon className="w-6 text-primary mr-2 h-6" />
                  <span className="text-sm font-medium truncate w-[200px]">
                    {file.name || `Image ${index + 1}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
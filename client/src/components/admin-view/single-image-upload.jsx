import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function SingleImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  imageLoadingState,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setImageFile(droppedFile);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl("");
  }

  async function uploadImageToServer() {
    if (!imageFile || !setImageLoadingState) return;

    setImageLoadingState(true);

    const data = new FormData();
    data.append("my-file", imageFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
        setImageLoadingState(false);
      } else {
        setImageLoadingState(false);
        console.error("Upload failed:", response?.data?.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile && !uploadedImageUrl) {
      uploadImageToServer();
    }
  }, [imageFile]);

  return (
    <div className={`w-full ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      {uploadedImageUrl ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileIcon className="w-8 text-primary mr-2 h-8" />
          </div>
          <p className="text-sm font-medium">{imageFile?.name}</p>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleRemoveImage}
          >
            <XIcon className="w-4 h-4" />
            <span className="sr-only">Remove File</span>
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !imageLoadingState && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`${
            isCustomStyling
              ? "border-2 border-dashed rounded-lg p-4"
              : "border-2 border-dashed rounded-lg p-4"
          } ${
            imageLoadingState
              ? "pointer-events-none opacity-50"
              : "cursor-pointer hover:border-primary"
          }`}
        >
          <div className="text-center">
            {imageLoadingState ? (
              <Skeleton className="h-10 w-10 mx-auto mb-2" />
            ) : (
              <UploadCloudIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground mb-2">
              {imageLoadingState ? (
                <span>Uploading...</span>
              ) : (
                <span>
                  Drag & drop or click to upload image
                </span>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={handleImageFileChange}
              accept="image/*"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleImageUpload;
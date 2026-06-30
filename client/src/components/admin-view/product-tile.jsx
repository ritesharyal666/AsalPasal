import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { getImageUrl } from "@/utils/imageHelper";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={getImageUrl(product?.images?.[0] || product?.image)}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
              e.target.classList.add("opacity-50");
            }}
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              Rs.{product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">Rs.{product?.salePrice}</span>
            ) : null}
          </div>
          {product?.costPrice && (
            <div className="text-sm text-muted-foreground mb-2">
              Profit Margin: {(((product?.salePrice || product?.price) - product?.costPrice) / product?.costPrice * 100).toFixed(1)}%
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData({
                ...product,
                category: product.category?._id || product.category,
                brand: product.brand?._id || product.brand,
              });
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;

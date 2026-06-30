import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getImageUrl } from "@/utils/imageHelper";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "lucide-react";

function ShoppingProductTile({
  product,
  handleAddtoCart,
}) {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden group transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
      <div className="relative">
        <div 
          onClick={() => navigate(`/shop/product/${product?.slug}`)}
          className="cursor-pointer"
        >
          <img
            src={getImageUrl(product?.images?.[0] || product?.image)}
            alt={product?.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
              e.target.classList.add("opacity-50");
            }}
          />
        </div>
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1">
            Out of Stock
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1">
            Only {product?.totalStock} left
          </Badge>
        ) : product?.salePrice > 0 ? (
          <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1">
            Sale
          </Badge>
        ) : null}
        {product?.totalStock > 0 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddtoCart(product?._id, product?.totalStock);
            }}
            size="icon"
            className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ShoppingCartIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
      <CardContent className="p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-snug">
          {product?.title}
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold ${
              product?.salePrice > 0 ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            Rs.{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-green-600">
              Rs.{product?.salePrice}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;
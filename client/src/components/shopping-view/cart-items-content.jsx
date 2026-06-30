import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { getImageUrl } from "@/utils/imageHelper";

function UserCartItemsContent({ cartItem, productList = [] }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length && productList && productList.length > 0) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProduct = productList.find(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = getCurrentProduct?.totalStock;

        console.log(getCurrentProduct, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1 && getTotalStock !== undefined) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} items available in stock`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : Math.max(1, getCartItem?.quantity - 1), // Ensure quantity doesn't go below 1
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={getImageUrl(cartItem?.images?.[0] || cartItem?.image)}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
          e.target.classList.add("opacity-50");
        }}
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full border-gray-600 text-gray-300 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 transition-all duration-200 hover:scale-105"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold text-white bg-gray-700 px-3 py-1 rounded-full min-w-[2rem] text-center">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className={`h-8 w-8 rounded-full transition-all duration-200 hover:scale-105 ${
              (() => {
                if (!productList || productList.length === 0) {
                  return "border-gray-600 text-gray-300 hover:bg-green-600/20 hover:border-green-500 hover:text-green-400";
                }
                const product = productList.find(p => p._id === cartItem.productId);
                const isAtLimit = product ? cartItem.quantity >= product.totalStock : false;
                return isAtLimit 
                  ? "border-gray-500 text-gray-500 cursor-not-allowed opacity-50" 
                  : "border-gray-600 text-gray-300 hover:bg-green-600/20 hover:border-green-500 hover:text-green-400";
              })()
            }`}
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
            disabled={(() => {
              if (!productList || productList.length === 0) return false;
              const product = productList.find(p => p._id === cartItem.productId);
              return product ? cartItem.quantity >= product.totalStock : false;
            })()}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold text-white">
          Rs.
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        {productList && productList.length > 0 && (() => {
          const product = productList.find(p => p._id === cartItem.productId);
          return product ? (
            <p className={`text-xs mt-1 ${
              cartItem.quantity >= product.totalStock 
                ? 'text-red-400' 
                : 'text-gray-400'
            }`}>
              {product.totalStock} in stock
            </p>
          ) : null;
        })()}
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;

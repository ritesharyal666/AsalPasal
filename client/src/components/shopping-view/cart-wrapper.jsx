import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { getImageUrl } from "@/utils/imageHelper";
import { fetchFrequentlyBoughtTogether } from "@/store/shop/recommend-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { frequentlyBought } = useSelector((state) => state.shopRecommend);

  const productIds = (cartItems || []).map((item) => item.productId);
  const productIdsKey = productIds.join(",");

  useEffect(() => {
    if (productIds.length > 0) {
      dispatch(
        fetchFrequentlyBoughtTogether({ productIds, limit: 3 })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, dispatch]);

  function handleAddToCart(productId) {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({ title: "Product is added to cart" });
        }
      }
    );
  }

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0
          ? cartItems.map((item) => <UserCartItemsContent key={item.productId} cartItem={item} />)
          : null}
      </div>

      {/* Frequently bought together (ML-powered) */}
      {cartItems && cartItems.length > 0 && frequentlyBought.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sm">Frequently bought together</h3>
          </div>
          <div className="space-y-3">
            {frequentlyBought.map((product) => (
              <div key={product._id} className="flex items-center gap-3">
                <img
                  src={getImageUrl(product?.images?.[0])}
                  alt={product?.title}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {product?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rs.
                    {product?.salePrice > 0 ? product.salePrice : product.price}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 flex-shrink-0"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product?.totalStock === 0}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">Rs.{totalCartAmount}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;

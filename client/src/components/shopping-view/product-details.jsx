import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { getImageUrl } from "@/utils/imageHelper";
import { useNavigate } from "react-router-dom";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    if (rating === 0) {
        toast({
            title: "Please select a rating",
            variant: "destructive"
        })
        return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null && productDetails?._id) {
        dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden rounded-lg border bg-slate-50">
          <img
            // FIXED: Handles both single image string and new images array
            src={getImageUrl(productDetails?.images?.[0] || productDetails?.image)} 
            alt={productDetails?.title}
            className="aspect-square w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="flex flex-col">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-lg mb-5 mt-4 leading-relaxed">
              {productDetails?.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through text-slate-400 text-2xl" : ""
              }`}
            >
              Rs.{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-3xl font-bold text-red-600">
                Rs.{productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-muted-foreground font-medium">
              ({averageReview.toFixed(1)})
            </span>
          </div>
          
          <div className="mt-5 mb-5 flex gap-3">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed" disabled>
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full py-6 text-lg"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
            
            {/* NEW: Button to go to the Slug-based Product Page */}
            <Button 
                variant="outline" 
                className="py-6"
                onClick={() => {
                    handleDialogClose();
                    navigate(`/shop/product/${productDetails?.slug}`);
                }}
            >
                View Full Details
            </Button>
          </div>

          <Separator />
          
          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div key={reviewItem._id} className="flex gap-4 p-3 rounded-lg border bg-slate-50/50">
                    <Avatar className="w-10 h-10 border shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{reviewItem?.userName}</h3>
                      </div>
                      <StarRatingComponent rating={reviewItem?.reviewValue} />
                      <p className="text-slate-600 mt-1 italic">
                        "{reviewItem.reviewMessage}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>

            {/* Write Review Section */}
            <div className="mt-10 mb-4 flex-col flex gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Label className="text-base font-bold text-slate-800">Share your thoughts</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                className="bg-white"
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="What did you like or dislike?"
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === "" || rating === 0}
                className="w-full"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
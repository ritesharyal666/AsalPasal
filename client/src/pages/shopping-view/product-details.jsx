import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import { fetchRelatedProducts } from "@/store/shop/recommend-slice";
import RecommendedProducts from "@/components/shopping-view/recommended-products";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/common/star-rating";
import { addReview, getReviews, editReview, deleteReview } from "@/store/shop/review-slice";
import { getImageUrl } from "@/utils/imageHelper";
import { Edit, Trash2 } from "lucide-react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

function ProductDetailsPage() {
  // FIX 1: Change 'id' to 'slug' to match your App.jsx route path="/shop/product/:slug"
  const { slug } = useParams(); 
  const dispatch = useDispatch();
  
  // FIX 2: Pull isLoading from state so the "Loading" div actually disappears
  const { productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { related, isLoadingRelated } = useSelector((state) => state.shopRecommend);
  const { toast } = useToast();

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    // FIX 3: Use the slug here
    if (slug) {
      dispatch(fetchProductDetails(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
      dispatch(fetchRelatedProducts({ productId: productDetails?._id, limit: 4 }));
    }
  }, [productDetails, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setProductDetails());
    };
  }, [dispatch]);

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

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data && data.payload && data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else {
        toast({
          title: "Failed to add review. Please try again.",
          variant: "destructive",
        });
      }
    }).catch(() => {
      toast({
        title: "Failed to add review. Please check your authentication.",
        variant: "destructive",
      });
    });
  }

  const handleEditReview = (reviewId, formdata) => {
    dispatch(editReview({ reviewId, formdata })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Review updated successfully!",
        });
        setEditingReview(null);
        dispatch(getReviews(productDetails?._id));
      } else {
        toast({
          title: "Failed to update review. Please try again.",
          variant: "destructive",
        });
      }
    }).catch(() => {
      toast({
        title: "Failed to update review. Please check your authentication.",
        variant: "destructive",
      });
    });
  };

  const handleDeleteReview = (reviewId) => {
    dispatch(deleteReview(reviewId)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Review deleted successfully!",
        });
        dispatch(getReviews(productDetails?._id));
      } else {
        toast({
          title: "Failed to delete review. Please try again.",
          variant: "destructive",
        });
      }
    }).catch(() => {
      toast({
        title: "Failed to delete review. Please check your authentication.",
        variant: "destructive",
      });
    });
  };

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  const images = productDetails?.images?.map((image) => ({
    original: getImageUrl(image),
    thumbnail: getImageUrl(image),
  })) || [];

  // FIX 4: Improved loading logic
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-lg">Loading Product...</span>
      </div>
    );
  }

  // FIX 5: Explicit check for missing product after loading is done
  if (!productDetails && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {images.length > 0 ? (
            <ImageGallery
              items={images}
              showPlayButton={false}
              showFullscreenButton={true}
              showNav={true}
              slideDuration={300}
              thumbnailPosition="bottom"
              useBrowserFullscreen={false}
            />
          ) : (
            <img
              src="https://via.placeholder.com/600x600?text=No+Image"
              alt={productDetails?.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {productDetails?.title}
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              {productDetails?.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-3xl font-bold ${
                productDetails?.salePrice > 0
                  ? "line-through text-gray-300"
                  : "text-yellow-400"
              }`}
            >
              Rs.{productDetails?.price}
            </span>
            {productDetails?.salePrice > 0 && (
              <span className="text-3xl font-bold text-green-400">
                Rs.{productDetails?.salePrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-gray-300">
              ({averageReview.toFixed(2)}) - {reviews?.length || 0} reviews
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Category:</span>
              <span className="text-gray-300 uppercase">{productDetails?.category}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">Brand:</span>
              <span className="text-gray-300 uppercase">{productDetails?.brand}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">Stock:</span>
              <span className={`font-medium ${productDetails?.totalStock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                {productDetails?.totalStock === 0 ? 'Out of Stock' : `${productDetails?.totalStock} available`}
              </span>
            </div>
          </div>

          <Button
            onClick={() =>
              handleAddToCart(productDetails?._id, productDetails?.totalStock)
            }
            disabled={productDetails?.totalStock === 0}
            className="w-full py-6 text-lg"
          >
            {productDetails?.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <Separator />
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>

          {user && (
            <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800/50">
              <h3 className="text-lg font-semibold mb-4 text-white">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <StarRatingComponent
                    rating={editingReview ? editingReview.reviewValue : rating}
                    handleRatingChange={editingReview ? (newRating) => setEditingReview({...editingReview, reviewValue: newRating}) : setRating}
                  />
                </div>
                <div>
                  <Label>Review Message</Label>
                  <Input
                    value={editingReview ? editingReview.reviewMessage : reviewMsg}
                    onChange={(e) => editingReview ? setEditingReview({...editingReview, reviewMessage: e.target.value}) : setReviewMsg(e.target.value)}
                    placeholder="Write your review..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingReview ? () => handleEditReview(editingReview._id, { reviewValue: editingReview.reviewValue, reviewMessage: editingReview.reviewMessage }) : handleAddReview} 
                    disabled={editingReview ? !editingReview.reviewValue || !editingReview.reviewMessage : !rating || !reviewMsg}
                  >
                    {editingReview ? "Update Review" : "Submit Review"}
                  </Button>
                  {editingReview && (
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingReview(null)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{review.userName}</span>
                      <StarRatingComponent rating={review.reviewValue} />
                    </div>
                    {user && user.id === review.userId && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                          className="border-gray-600 text-gray-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-400 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          className="border-gray-600 text-gray-300 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300">{review.reviewMessage}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Separator />
        <RecommendedProducts
          title="You may also like"
          subtitle="Picked by our recommendation engine"
          products={related}
          isLoading={isLoadingRelated}
          handleAddtoCart={handleAddToCart}
        />
      </div>
    </div>
  );
}

export default ProductDetailsPage;
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import RecommendedProducts from "@/components/shopping-view/recommended-products";
import { fetchRecommendationsForUser } from "@/store/shop/recommend-slice";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import { fetchAllCategories, fetchAllBrands } from "@/store/admin/category-brand-slice";
import { getImageUrl } from "@/utils/imageHelper";

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { categories, brands } = useSelector((state) => state.adminCategoryBrand);
  const { forYou, isLoadingForYou } = useSelector((state) => state.shopRecommend);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleAddtoCart(getCurrentProductId) {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchAllCategories());
    dispatch(fetchAllBrands());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRecommendationsForUser({ userId: user?.id, limit: 8 }));
  }, [dispatch, user?.id]);

  // Create dynamic categories with images
  const getCategoriesWithIcon = () => {
    return categories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category._id,
        label: category.label,
        image: category.image,
      }));
  };

  // Create dynamic brands with images
  const getBrandsWithIcon = () => {
    return brands
      .filter((brand) => brand.isActive)
      .map((brand) => ({
        id: brand._id,
        label: brand.label,
        image: brand.image,
      }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">

      {/* Hero Banner with improved styling */}
      <div className="relative w-full h-[650px] overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <img
                src={getImageUrl(slide?.image)}
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                } absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ease-in-out`}
                alt="Featured banner"
              />
            ))
          : null}
        
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length
            )
          }
          className="absolute top-1/2 left-6 transform -translate-y-1/2 z-20 bg-slate-900/40 backdrop-blur-md border-slate-700/50 text-white hover:bg-slate-800/60 hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full shadow-2xl"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-6 transform -translate-y-1/2 z-20 bg-slate-900/40 backdrop-blur-md border-slate-700/50 text-white hover:bg-slate-800/60 hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full shadow-2xl"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {featureImageList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-10 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Shop by Category */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-slate-300 text-lg">Discover our curated collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {getCategoriesWithIcon().map((categoryItem) => (
              <div
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer group"
              >
                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-0 aspect-square flex items-center justify-center">
                    <img
                      src={getImageUrl(categoryItem.image)}
                      alt={categoryItem.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                  </CardContent>
                </Card>
                <p className="mt-4 text-center font-semibold text-slate-100 text-lg group-hover:text-white transition-colors duration-300">
                  {categoryItem.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Shop by Brand
            </h2>
            <p className="text-slate-300 text-lg">Explore your favorite brands</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {getBrandsWithIcon().map((brandItem) => (
              <div
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer group"
              >
                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-0 aspect-square flex items-center justify-center">
                    <img
                      src={getImageUrl(brandItem.image)}
                      alt={brandItem.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                  </CardContent>
                </Card>
                <p className="mt-4 text-center font-semibold text-slate-100 text-lg group-hover:text-white transition-colors duration-300">
                  {brandItem.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended for you (ML-powered) */}
      <RecommendedProducts
        title={user ? "Recommended for you" : "Popular right now"}
        subtitle={
          user
            ? "Personalized from your activity"
            : "Trending picks across the store"
        }
        products={forYou}
        isLoading={isLoadingForYou}
        handleAddtoCart={handleAddtoCart}
      />

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Featured Products
            </h2>
            <p className="text-slate-300 text-lg">Handpicked items just for you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
        </div>
      </section>

    </div>
  );
}

export default ShoppingHome;
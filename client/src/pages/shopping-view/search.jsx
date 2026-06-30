import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom"; // MISSING IMPORT
import { fetchAllCategories, fetchAllBrands } from "@/store/admin/category-brand-slice";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const { searchResults, pagination, searchInfo, isLoading } = useSelector((state) => state.shopSearch);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { categories, brands } = useSelector((state) => state.adminCategoryBrand);
  const { toast } = useToast();

  const performSearch = (searchKeyword, page = 1, searchFilters = filters) => {
    if (searchKeyword && searchKeyword.trim() !== "") {
      const trimmedKeyword = searchKeyword.trim();
      
      // Only send non-empty filter values
      const cleanFilters = {};
      if (searchFilters.category) cleanFilters.category = searchFilters.category;
      if (searchFilters.brand) cleanFilters.brand = searchFilters.brand;
      if (searchFilters.minPrice) cleanFilters.minPrice = searchFilters.minPrice;
      if (searchFilters.maxPrice) cleanFilters.maxPrice = searchFilters.maxPrice;

      dispatch(getSearchResults({ keyword: trimmedKeyword, filters: cleanFilters, page }));
      setSearchParams(new URLSearchParams(`?keyword=${trimmedKeyword}&page=${page}`));
    } else {
      dispatch(resetSearchResults());
    }
  };

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllBrands());
  }, [dispatch]);

  useEffect(() => {
    if (keyword && keyword.trim() !== "") {
      performSearch(keyword, 1);
      setCurrentPage(1);
    } else {
      dispatch(resetSearchResults());
    }
  }, [keyword, filters]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
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

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center space-x-4">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6 flex-1"
            placeholder="Search Products..."
          />
          <Button onClick={() => performSearch(keyword, 1)}>Search</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Select
          value={filters.category || "none"}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "none" ? undefined : value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.isActive).map(cat => (
              <SelectItem key={cat._id} value={cat._id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.brand}
          onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Brands</SelectItem>
            {brands.filter(b => b.isActive).map(b => (
              <SelectItem key={b._id} value={b._id}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
          className="w-32"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
          className="w-32"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-400">Searching...</p>
        </div>
      ) : !searchResults.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-extrabold text-slate-200 mb-2">No results found!</h1>
          <p className="text-slate-400">Try different keywords or filters</p>
        </div>
      ) : (
        <>
          <div className="search-info text-center mb-6 bg-slate-900 rounded-lg p-4 border border-slate-800">
            <p className="text-slate-300">
              Found <span className="font-bold text-purple-400">{pagination.totalProducts || 0}</span> results for 
              <span className="font-bold text-purple-400"> "{keyword}"</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item._id}
                handleAddtoCart={handleAddtoCart}
                product={item}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <Button
                disabled={!pagination.hasPrev}
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  performSearch(keyword, newPage);
                }}
                className="px-6"
              >
                Previous
              </Button>
              <span className="text-slate-300 font-medium">
                Page <span className="text-purple-400">{pagination.currentPage}</span> of <span className="text-purple-400">{pagination.totalPages}</span>
              </span>
              <Button
                disabled={!pagination.hasNext}
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  performSearch(keyword, newPage);
                }}
                className="px-6"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchProducts;
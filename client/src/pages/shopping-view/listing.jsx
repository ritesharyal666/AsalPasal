import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
} from "@/store/shop/products-slice";
import { getSearchResults } from "@/store/shop/search-slice";
import { fetchAllCategories, fetchAllBrands } from "@/store/admin/category-brand-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  console.log(queryParams, "queryParams");

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, pagination } = useSelector(
    (state) => state.shopProducts
  );
  const { searchResults, pagination: searchPagination } = useSelector(
    (state) => state.shopSearch
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  
  // Use search results if searching, otherwise use product list
  const displayProducts = searchParam ? searchResults : productList;
  const displayPagination = searchParam ? searchPagination : pagination;

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

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

  useEffect(() => {
    setSort("price-lowtohigh");
    const storedFilters = JSON.parse(sessionStorage.getItem("filters")) || {};
    if (categorySearchParam) {
      storedFilters.category = [categorySearchParam];
    }
    if (searchParam) {
      storedFilters.search = [searchParam];
    }
    setFilters(storedFilters);
    dispatch(fetchAllCategories());
    dispatch(fetchAllBrands());
  }, [categorySearchParam, searchParam, dispatch]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      // If there's a search query, use the search API instead
      if (searchParam) {
        dispatch(
          getSearchResults({ keyword: searchParam, filters, page: currentPage })
        );
      } else {
        // Otherwise use the filtered products API
        dispatch(
          fetchAllFilteredProducts({ filterParams: filters, sortParams: sort, page: currentPage })
        );
      }
    }
  }, [dispatch, sort, filters, currentPage, searchParam]);

  console.log(productList, "productListproductListproductList");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-[1600px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filter Sidebar */}
          <aside className="transition-all duration-300">
            <ProductFilter filters={filters} handleFilter={handleFilter} />
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Header Section */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 hover:border-slate-700">
              <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    All Products
                  </h2>
                  <p className="text-slate-400 text-lg">
                    {productList?.length} {productList?.length === 1 ? 'Product' : 'Products'} Available
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 text-base px-6 py-6"
                    >
                      <ArrowUpDownIcon className="h-5 w-5 mr-2" />
                      <span>Sort by</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[220px] bg-slate-900 border-slate-800 text-slate-100"
                  >
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem
                          value={sortItem.id}
                          key={sortItem.id}
                          className="text-base py-3 cursor-pointer hover:bg-slate-800 transition-colors duration-300"
                        >
                          {sortItem.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts && displayProducts.length > 0
                ? displayProducts.map((productItem) => (
                    <div 
                      key={productItem._id}
                      className="transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <ShoppingProductTile
                        product={productItem}
                        handleAddtoCart={handleAddtoCart}
                      />
                    </div>
                  ))
                : (
                  <div className="col-span-full flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🔍</div>
                      <h3 className="text-2xl font-semibold text-slate-200">No Products Found</h3>
                      <p className="text-slate-400 text-lg">Try adjusting your filters or search criteria</p>
                    </div>
                  </div>
                )}
            </div>

            {/* Pagination */}
            {displayPagination && displayPagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  disabled={!displayPagination.hasPrev}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="self-center">Page {displayPagination.currentPage} of {displayPagination.totalPages}</span>
                <Button
                  disabled={!displayPagination.hasNext}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListing;
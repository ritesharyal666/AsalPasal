import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { useSelector } from "react-redux";

function ProductFilter({ filters, handleFilter }) {
  const { categories, brands } = useSelector((state) => state.adminCategoryBrand);

  // Create dynamic filter options
  const filterOptions = {
    category: categories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category._id,
        label: category.label,
      })),
    brand: brands
      .filter((brand) => brand.isActive)
      .map((brand) => ({
        id: brand._id,
        label: brand.label,
      })),
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-extrabold text-slate-200">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold text-slate-300 capitalize">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label key={option.id} className="flex font-medium items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator className="bg-slate-700" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;

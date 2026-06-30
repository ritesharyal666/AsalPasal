import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange }) {
  console.log(rating, "rating");

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      key={star}
      className={`p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 ${
        star <= rating
          ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 shadow-lg shadow-yellow-500/30"
          : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 hover:shadow-md hover:shadow-yellow-500/20"
      }`}
      variant="ghost"
      size="icon"
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
    >
      <StarIcon
        className={`w-6 h-6 transition-all duration-300 ${
          star <= rating
            ? "fill-yellow-400 drop-shadow-lg"
            : "fill-transparent hover:fill-yellow-400/50"
        }`}
      />
    </Button>
  ));
}

export default StarRatingComponent;

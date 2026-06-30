const API_URL = "http://localhost:5000";

export function getImageUrl(imagePath) {
  if (!imagePath) return "";
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API URL
  return `${API_URL}${imagePath}`;
}

export default getImageUrl;
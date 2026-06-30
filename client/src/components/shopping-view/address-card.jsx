import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 ${
        selectedId?._id === addressInfo?._id
          ? "border-purple-500 border-[3px] shadow-lg shadow-purple-500/20"
          : "border-slate-600 hover:border-slate-500"
      }`}
    >
      <CardContent className="grid p-4 gap-4">
        <Label className="text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          Address: <span className="text-slate-200 font-medium">{addressInfo?.address}</span>
        </Label>
        <Label className="text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          City: <span className="text-slate-200 font-medium">{addressInfo?.city}</span>
        </Label>
        <Label className="text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          Pincode: <span className="text-slate-200 font-medium">{addressInfo?.pincode}</span>
        </Label>
        <Label className="text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          Phone: <span className="text-slate-200 font-medium">{addressInfo?.phone}</span>
        </Label>
        <Label className="text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
          Notes: <span className="text-slate-200 font-medium">{addressInfo?.notes}</span>
        </Label>
      </CardContent>
      <CardFooter className="p-3 flex justify-between bg-slate-800/30">
        <Button 
          onClick={() => handleEditAddress(addressInfo)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        >
          Edit
        </Button>
        <Button 
          onClick={() => handleDeleteAddress(addressInfo)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;

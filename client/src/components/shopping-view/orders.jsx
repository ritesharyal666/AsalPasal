import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  console.log(orderDetails, "orderDetails");

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-700/30">
              <TableHead className="text-slate-300">Order ID</TableHead>
              <TableHead className="text-slate-300">Order Date</TableHead>
              <TableHead className="text-slate-300">Order Status</TableHead>
              <TableHead className="text-slate-300">Order Price</TableHead>
              <TableHead className="text-slate-300">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="text-slate-300 font-mono text-sm">{orderItem?._id}</TableCell>
                    <TableCell className="text-slate-300">{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 text-white ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-600 hover:bg-green-700"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 font-semibold">Rs.{orderItem?.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                        >
                          View Details
                        </Button>
                        <ShoppingOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;

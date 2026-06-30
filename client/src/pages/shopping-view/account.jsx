import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateUserProfile, checkAuth } from "@/store/auth-slice";
import { User, Mail, Phone, Edit2, Save, X } from "lucide-react";

function ShoppingAccount() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure we have fresh user data
    if (!user) {
      dispatch(checkAuth());
    }
  }, [dispatch, user]);

  useEffect(() => {
    console.log("Account page user data:", user);
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^9[78]\d{8}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = "Please enter a valid Nepal phone number (98xxxxxxxx or 97xxxxxxxx)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    dispatch(updateUserProfile(formData)).then((data) => {
      setIsUpdating(false);
      if (data?.payload?.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: data?.payload?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    });
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Banner */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-blue-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-8 left-8 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            My Account
          </h1>
          <p className="text-slate-300 text-lg">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-1 mb-8">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-xl transition-all duration-300"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-xl transition-all duration-300"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="address"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-xl transition-all duration-300"
              >
                Address
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              {isLoading ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <p className="text-sm text-slate-300">Loading profile...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
                  <CardHeader className="border-b border-slate-700/50">
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-400" />
                        Account Information
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSave} 
                            size="sm" 
                            disabled={isUpdating}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isUpdating ? "Saving..." : "Save"}
                          </Button>
                          <Button 
                            onClick={handleCancel} 
                            size="sm" 
                            variant="outline"
                            disabled={isUpdating}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-2 text-slate-300">
                          <User className="h-4 w-4 text-purple-400" />
                          First Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 ${errors.firstName ? "border-red-500" : ""}`}
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/30">
                            <span className="text-sm text-slate-300">
                              {user?.firstName || (isLoading ? "Loading..." : "Not provided")}
                            </span>
                          </div>
                        )}
                        {errors.firstName && (
                          <p className="text-sm text-red-400">{errors.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="flex items-center gap-2 text-slate-300">
                          <User className="h-4 w-4 text-purple-400" />
                          Last Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 ${errors.lastName ? "border-red-500" : ""}`}
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/30">
                            <span className="text-sm text-slate-300">
                              {user?.lastName || (isLoading ? "Loading..." : "Not provided")}
                            </span>
                          </div>
                        )}
                        {errors.lastName && (
                          <p className="text-sm text-red-400">{errors.lastName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userName" className="flex items-center gap-2 text-slate-300">
                          <User className="h-4 w-4 text-purple-400" />
                          Username
                        </Label>
                        {isEditing ? (
                          <Input
                            id="userName"
                            value={formData.userName}
                            onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 ${errors.userName ? "border-red-500" : ""}`}
                            placeholder="Enter your username"
                          />
                        ) : (
                          <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/30">
                            <span className="text-sm text-slate-300">@{user?.userName}</span>
                          </div>
                        )}
                        {errors.userName && (
                          <p className="text-sm text-red-400">{errors.userName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                          <Mail className="h-4 w-4 text-purple-400" />
                          Email Address
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 ${errors.email ? "border-red-500" : ""}`}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/30">
                            <span className="text-sm text-slate-300">{user?.email}</span>
                          </div>
                        )}
                        {errors.email && (
                          <p className="text-sm text-red-400">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-slate-300">
                          <Phone className="h-4 w-4 text-purple-400" />
                          Phone Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 ${errors.phone ? "border-red-500" : ""}`}
                            placeholder="98xxxxxxxx or 97xxxxxxxx"
                          />
                        ) : (
                          <div className="flex items-center p-3 border border-slate-600 rounded-md bg-slate-700/30">
                            <span className="text-sm text-slate-300">
                              {user?.phone || (isLoading ? "Loading..." : "Not provided")}
                            </span>
                          </div>
                        )}
                        {errors.phone && (
                          <p className="text-sm text-red-400">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>
            
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";

const resetPasswordFormControls = [
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Enter your new password",
    componentType: "input",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Confirm your new password",
    componentType: "input",
    type: "password",
  },
];

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: "Invalid reset link.",
        variant: "destructive",
      });
      navigate("/auth/login");
    }
  }, [searchParams, navigate, toast]);

  function validateForm() {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.newPassword })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Password reset successfully! You can now log in.",
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="mt-2">
          Enter your new password.
        </p>
      </div>
      <CommonForm
        formControls={resetPasswordFormControls}
        buttonText={"Reset Password"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        errors={errors}
      />
    </div>
  );
}

export default ResetPassword;
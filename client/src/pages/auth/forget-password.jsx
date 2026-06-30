import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { forgetPassword } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";

const forgetPasswordFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
];

function ForgetPassword() {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { toast } = useToast();

  function validateForm() {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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

    dispatch(forgetPassword(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Password reset email sent. Check your inbox.",
        });
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
          Forgot Password
        </h1>
        <p className="mt-2">
          Enter your email to receive a password reset link.
        </p>
      </div>
      <CommonForm
        formControls={forgetPasswordFormControls}
        buttonText={"Send Reset Email"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        errors={errors}
      />
      <div className="text-center">
        <Link
          className="text-sm text-primary hover:underline"
          to="/auth/login"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgetPassword;
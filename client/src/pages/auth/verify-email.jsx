import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyEmail } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      dispatch(verifyEmail({ token })).then((data) => {
        setLoading(false);
        if (data?.payload?.success) {
          toast({
            title: "Email verified successfully! You can now log in.",
          });
          navigate("/auth/login");
        } else {
          toast({
            title: data?.payload?.message || "Verification failed.",
            variant: "destructive",
          });
        }
      });
    } else {
      setLoading(false);
      toast({
        title: "Invalid verification link.",
        variant: "destructive",
      });
    }
  }, [searchParams, dispatch, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
          <p>Please wait while we verify your account.</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verification Complete</h1>
          <p>Redirecting to login...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
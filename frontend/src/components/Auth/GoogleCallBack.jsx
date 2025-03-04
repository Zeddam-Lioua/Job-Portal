import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");

      if (code) {
        try {
          const response = await googleLogin(code);
          if (response.user_type === "human_resources") {
            navigate("/admin/hr/dashboard");
          } else if (response.user_type === "district_manager") {
            navigate("/admin/dm/dashboard");
          }
        } catch (error) {
          console.error("Google callback error:", error);
          navigate("/admin/login");
        }
      } else {
        navigate("/admin/login");
      }
    };

    handleCallback();
  }, [location, navigate, googleLogin]);

  return <div>Processing Google login...</div>;
};

export default GoogleCallback;

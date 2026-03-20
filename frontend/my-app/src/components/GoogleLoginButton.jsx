import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function GoogleLoginButton() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    // ✅ ADD HERE
    console.log("credentialResponse:", credentialResponse);
    console.log("credential token:", credentialResponse.credential);
    try {
      console.log("Google credentialResponse:", credentialResponse);

      const res = await axios.post("http://127.0.0.1:8000/api/user/google-login/", {
        token: credentialResponse.credential,
      });

      console.log("Google login backend response:", res.data);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.user.name || res.data.user.email);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("picture", res.data.user.picture || "");

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Google login failed");
    }
  };

  const handleError = () => {
    alert("Google Sign-In was unsuccessful");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}

export default GoogleLoginButton;
import { useState, useEffect } from "react";
import { MdEmail, MdLock } from "react-icons/md";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import colors from "../../styles/colors";
import logo from "../../assets/images/AppLogo2.png";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import "./auth.css";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState(""); 
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showOtp, setShowOtp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotFlow, setForgotFlow] = useState(false);
  
  const [tempData, setTempData] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("showWelcomeToast"); // Reset on load
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!employeeId) newErrors.employeeId = "Employee ID is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        employee_code: employeeId,
        password: password,
        device_type: "web",
        player_id: "web_player_id_123"
      });

      const { status, data, token, user, message } = response.data;

      // Case 1: Direct Login Success
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user || {}));
        
        // 🔥 SET FLAG FOR DASHBOARD
        sessionStorage.setItem("showWelcomeToast", "true");
        
        navigate("/dashboard");
      } 
      // Case 2: OTP Required
      else if (status === "otp_sent" || message?.includes("OTP")) { 
         setTempData({ 
             employee_id: data?.employee_id || response.data.employee_id,
             employee_code: employeeId 
         }); 
         setForgotFlow(false);
         setShowOtp(true);
         toast.info("OTP sent to your email.");
      }
      else {
         toast.error(message || "Invalid credentials provided.");
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Wrong Password or Employee ID";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
     
      <style>{`input::-ms-reveal, input::-ms-clear { display: none; }`}</style>

      <div style={pageWrapper}>
        <div style={loginContainer}>
          <Card>
            <div style={headerSection}>
              <img src={logo} alt="logo" width={100} style={{ marginBottom: "10px" }} />
              <h2 style={titleStyle}>Welcome Back</h2>
              <p style={subtitleStyle}>Enter your Login Details</p>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <InputField
                label="Employee ID"
                icon={MdEmail}
                placeholder="Enter your ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                error={errors.employeeId}
              />

              <InputField
                label="Password"
                type="password"
                icon={MdLock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div style={forgotPasswordWrapper}>
                <span onClick={() => { setForgotFlow(true); setShowForgot(true); }} style={forgotLinkStyle}>
                  Forgot password?
                </span>
              </div>

              <div onMouseEnter={() => setIsBtnHovered(true)} onMouseLeave={() => setIsBtnHovered(false)}>
                <Button 
                  label={isLoading ? "Signing In..." : "Login"} 
                  fullWidth 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: isBtnHovered ? "#333333" : "#000000", 
                    color: "#ffffff",
                    border: "1px solid #000000",
                    transition: "all 0.3s ease",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1
                  }} 
                />
              </div>
            </form>
          </Card>
        </div>
      </div>

      {showForgot && (
        <ForgotPassword
          onClose={() => setShowForgot(false)}
          onOtpSent={(id) => { 
             if(id) setTempData({ employee_id: id });
             setShowForgot(false); 
             setShowOtp(true); 
          }}
        />
      )}

      {showOtp && (
        <VerifyOtp
          flow={forgotFlow ? "forgot" : "login"}
          employeeId={tempData?.employee_id} 
          employeeCode={tempData?.employee_code || employeeId}
          onClose={() => setShowOtp(false)}
          onOtpVerified={(token) => {
            if (token) {
               localStorage.setItem("authToken", token);
               
               // 🔥 SET FLAG FOR DASHBOARD (OTP Case)
               sessionStorage.setItem("showWelcomeToast", "true");
               
               setShowOtp(false);
               navigate("/dashboard");
            } 
          }}
        />
      )}
    </>
  );
};

// ... keep your styles objects (pageWrapper, etc.) exactly as they were ...
const pageWrapper = { minHeight: "100vh", backgroundColor: "#f4f7fe", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" };
const loginContainer = { width: "100%", maxWidth: "420px", animation: "fadeIn 0.6s ease-out" };
const headerSection = { textAlign: "center", marginBottom: "20px" };
const titleStyle = { margin: 0, color: colors.textMain, fontSize: "24px", fontWeight: "700" };
const subtitleStyle = { color: colors.textMuted, fontSize: "14px", marginTop: "5px" };
const forgotPasswordWrapper = { display: "flex", justifyContent: "flex-end", marginTop: "4px", marginBottom: "20px" };
const forgotLinkStyle = { cursor: "pointer", color: colors.primary, fontSize: "13px", fontWeight: "600" };

export default Login;
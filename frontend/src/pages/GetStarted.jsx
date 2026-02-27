import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import getStartedImg from "../assets/images/getstarted.svg";
import { signIn, signUp, validatePassword } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const GetStarted = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });

  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === "recruiter" ? "/recruiterDashboard" : (user.onboardingCompleted ? "/candidateDashboard" : "/onboarding");
      navigate(redirectPath);
    }
  }, [user, navigate]);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");

    // Real-time password validation feedback
    if (name === "password" && !isLogin && value) {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    } else if (name === "password") {
      setPasswordErrors([]);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        const result = await signIn(formData.email, formData.password);

        if (result.success) {
          toast.success("Login successful! Welcome back!");
          login(result.user, result.token);
          // Redirection will be handled by useEffect
        } else if (result.needsVerification) {
          localStorage.setItem('userEmail', formData.email);
          toast.warning("Please verify your email before logging in.");
          navigate('/verification-pending');
        } else {
          toast.error(result.error || "Login failed. Please try again.");
          setError(result.error || "Login failed. Please try again.");
        }
      } else {
        // Sign up
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        // Validate password
        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
          setPasswordErrors(validation.errors);
          setError("Password does not meet requirements");
          setLoading(false);
          return;
        }

        const result = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );

        if (result.success) {
          localStorage.setItem('userEmail', formData.email);
          toast.success("Account created! Please check your email for verification.");
          navigate('/verification-pending');
        } else {
          toast.error(result.error || "Sign up failed. Please try again.");
          setError(result.error || "Sign up failed. Please try again.");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "candidate",
    });
    setError("");
    setPasswordErrors([]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image (same as original) */}
      <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-10">
        <img src={getStartedImg} alt="AI Career Illustration" className="max-w-md" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
            {isLogin ? "Welcome Back!" : "Create Your Account"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 pr-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {isLogin && (
                <div className="text-right mt-1">
                  <Link to="/forgot-password" size="xs" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-6 border-t pt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={toggleMode} className="text-blue-600 hover:underline font-medium">
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;

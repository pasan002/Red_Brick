import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiLock,
  FiMapPin,
  FiCalendar,
  FiImage,
} from "react-icons/fi";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    proPic: "",
    fName: "",
    lName: "",
    address: "",
    dob: "",
    gender: "",
    email: "",
    pwd: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (error) setError("");
  };

  const passwordsMatch = () => {
    return formData.pwd === formData.confirmPassword;
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (2MB limit)
      if (file.size > 1024 * 1024 * 2) {
        setError("Profile picture must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, proPic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Client-side validation
    if (!passwordsMatch()) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.pwd.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.pwd)) {
      setError(
        "Password must include uppercase, lowercase, number and special character"
      );
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const currentDate = new Date();
    const selectedDate = new Date(formData.dob);
    if (selectedDate > currentDate) {
      setError("Date of birth cannot be in the future");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proPic: formData.proPic,
          fName: formData.fName,
          lName: formData.lName,
          address: formData.address,
          dob: formData.dob,
          gender: formData.gender,
          email: formData.email,
          pwd: formData.pwd,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // After successful registration, automatically sign in
      try {
        const signInResponse = await fetch("http://localhost:4000/api/user/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            pwd: formData.pwd,
          }),
        });

        const signInData = await signInResponse.json();

        if (signInResponse.ok && signInData.data) {
          // Use login from AuthContext
          login(signInData.data);
          
          // Redirect based on user role (likely a regular user)
          if (signInData.data.user.role === "ADMIN") {
            navigate("/admin-dashboard");
          } else {
            navigate("/userdashboard");
          }
        } else {
          // If auto-login fails, just redirect to sign in page
          navigate("/signin");
        }
      } catch (signInErr) {
        console.error("Auto sign-in failed:", signInErr);
        navigate("/signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Image/Banner (unchanged) */}
        <div className="md:w-1/2 bg-gradient-to-br from-red-500 to-red-700 p-12 text-white flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to RedBrick</h1>
          <p className="text-red-100 text-lg mb-8">
            Join our platform to manage your construction projects efficiently
            and effectively.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-red-400/20 p-2 rounded-full mr-4">
                <FiUser className="w-6 h-6" />
              </div>
              <p>Create and manage projects</p>
            </div>
            <div className="flex items-center">
              <div className="bg-red-400/20 p-2 rounded-full mr-4">
                <FiMapPin className="w-6 h-6" />
              </div>
              <p>Collaborate with team members</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">
              Start your journey with us today
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="col-span-2 flex justify-center">
              <div className="relative">
                <img
                  src={
                    formData.proPic ||
                    "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-red-500"
                  onError={(e) => {
                    e.target.src =
                      "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain";
                  }}
                />
                <input
                  type="file"
                  id="proPic"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
                <label
                  htmlFor="proPic"
                  className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer"
                >
                  <FiImage className="h-4 w-4" />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (
                        /^\d$/.test(e.key) &&
                        !e.ctrlKey &&
                        !e.altKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    required
                    className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="First Name"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onKeyDown={(e) => {
                      if (
                        /^\d$/.test(e.key) &&
                        !e.ctrlKey &&
                        !e.altKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                  placeholder="123 Main St"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="pwd"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                    title="Password must be at least 8 characters and include uppercase, lowercase, number and special character"
                    value={formData.pwd}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="Create a password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must include uppercase, lowercase, number and special
                  character (8+ characters)
                </p>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                    title="Password must be at least 8 characters and include uppercase, lowercase, number and special character"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`pl-10 w-full rounded-lg focus:ring-red-500 focus:border-red-500 ${
                      formData.pwd && formData.confirmPassword
                        ? passwordsMatch()
                          ? "border-green-300"
                          : "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                  />
                  {formData.pwd && formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {passwordsMatch() ? (
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {formData.pwd &&
                  formData.confirmPassword &&
                  !passwordsMatch() && (
                    <p className="mt-1 text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                I agree to the{" "}
                <a href="#" className="text-red-600 hover:text-red-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-red-600 hover:text-red-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                (formData.pwd && formData.confirmPassword && !passwordsMatch())
              }
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors
                ${
                  isLoading ||
                  (formData.pwd &&
                    formData.confirmPassword &&
                    !passwordsMatch())
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating your account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-red-600 hover:text-red-500"
              >
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

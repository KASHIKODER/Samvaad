import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import { 
  RiUser3Line, 
  RiLock2Line, 
  RiMailLine, 
  RiEyeLine, 
  RiEyeOffLine,
  RiChat1Line,
  RiSparkling2Fill,
  RiArrowRightLine,
  RiShieldCheckLine,
} from "react-icons/ri";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [particles, setParticles] = useState([]);

  // Create floating particles (less on mobile)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 8 : 15;
    
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 3 : 4) + 1,
      speed: Math.random() * 1 + 0.5,
      color: ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9'][Math.floor(Math.random() * 4)],
    }));
    setParticles(newParticles);
  }, []);

  const validateLogin = () => {
    if (!email.trim()) {
      toast.error("✗ Email is required", {
        description: "Please enter your email address"
      });
      return false;
    }
    
    if (!password.trim()) {
      toast.error("✗ Password is required", {
        description: "Please enter your password"
      });
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("✗ Invalid email format", {
        description: "Please enter a valid email address"
      });
      return false;
    }
    
    return true;
  };

  const validateSignup = () => {
    // Check email
    if (!email.trim()) {
      toast.error("✗ Email is required", {
        description: "Please enter your email address"
      });
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("✗ Invalid email format", {
        description: "Please enter a valid email address"
      });
      return false;
    }
    
    // Check password
    if (!password.trim()) {
      toast.error("✗ Password is required", {
        description: "Please create a password"
      });
      return false;
    }
    
    if (password.length < 6) {
      toast.error("✗ Password too short", {
        description: "Password must be at least 6 characters long"
      });
      return false;
    }
    
    // Check confirm password
    if (!confirmPassword.trim()) {
      toast.error("✗ Confirm password required", {
        description: "Please confirm your password"
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error("✗ Passwords don't match", {
        description: "Please make sure both passwords match"
      });
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setIsLoading(true);
    
    try {
      const response = await authClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );
      
      if (response.data.user?.id) {
        setUserInfo(response.data.user);
        toast.success("✓ Login successful!", {
          description: "Welcome back to Samvaad!"
        });
        
        setTimeout(() => {
          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }, 500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === "User with the given email not found.") {
        toast.error("✗ Email not found", {
          description: "This email is not registered. Please sign up first."
        });
      } else if (errorMessage === "Password is incorrect.") {
        toast.error("✗ Incorrect password", {
          description: "The password you entered is incorrect. Please try again."
        });
      } else if (errorMessage === "Email and Password is required.") {
        toast.error("✗ Missing information", {
          description: "Both email and password are required."
        });
      } else if (error.response?.status === 404) {
        toast.error("✗ User not found", {
          description: "This email is not registered. Please sign up first."
        });
      } else if (error.response?.status === 400) {
        toast.error("✗ Invalid credentials", {
          description: "Please check your email and password."
        });
      } else {
        toast.error("✗ Login failed", {
          description: errorMessage || "Something went wrong. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    setIsLoading(true);
    
    try {
      const response = await authClient.post(
        SIGNUP_ROUTE,
        { email, password },
        { withCredentials: true }
      );
      
      if (response.data.user?.id) {
        setUserInfo(response.data.user);
        toast.success("✓ Account created!", {
          description: "Welcome to Samvaad! Your account has been created successfully."
        });
        
        setTimeout(() => {
          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }, 500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === "Email already exists." || error.code === 11000) {
        toast.error("✗ Email already registered", {
          description: "This email is already in use. Please try logging in instead."
        });
      } else if (errorMessage === "Email and Password is required.") {
        toast.error("✗ Missing information", {
          description: "Both email and password are required."
        });
      } else if (error.response?.status === 409) {
        toast.error("✗ Email already exists", {
          description: "This email is already registered. Please use a different email or login."
        });
      } else if (error.response?.status === 404) {
        toast.error("✗ Required fields missing", {
          description: "Please fill in all required fields."
        });
      } else {
        toast.error("✗ Signup failed", {
          description: errorMessage || "Something went wrong. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to show success toast
  const showSuccessToast = (message, description = "") => {
    toast.success(`✓ ${message}`, {
      description: description
    });
  };

  // Helper function to show error toast
  const showErrorToast = (message, description = "") => {
    toast.error(`✗ ${message}`, {
      description: description
    });
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden relative">
      {/* Animated background particles - Reduced opacity on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full hidden sm:block"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: 0.4,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(particle.id) * 10, 0],
            }}
            transition={{
              duration: particle.speed * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content with scrollable container for mobile */}
      <div className="relative z-10 h-full w-full flex items-center justify-center p-2 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl my-auto"
        >
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center">
            {/* Left side - Hero section - Hidden on small screens */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-1/2 text-center lg:text-left hidden md:block"
            >
              <div className="mb-6 md:mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
                    <RiChat1Line className="text-2xl md:text-3xl text-white" />
                  </div>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Samvaad ~ ( by KashiKoder )
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Connect
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Beyond Limits
                  </span>
                </h1>
                
                <p className="text-gray-400 text-base md:text-lg mb-6 md:mb-8 max-w-xl">
                  Message instantly, connect effortlessly, and build real conversations — all in one place.
                </p>
                
                <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
                  {['⚡ Real-time'].map((feature, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gray-900/50 border border-gray-800 text-gray-300 text-xs md:text-sm font-medium backdrop-blur-sm"
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right side - Auth card - Full width on mobile */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:w-1/2 w-full max-w-md md:max-w-lg mx-auto"
            >
              {/* Mobile-only header for small screens */}
              <div className="md:hidden mb-6 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <RiChat1Line className="text-2xl text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Samvaad
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  by KashiKoder
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
                {/* Glass morphism header */}
                <div className="relative p-4 md:p-6 lg:p-8 border-b border-gray-800/50">
                  <div className="absolute top-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-0 mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white text-center sm:text-left">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={activeTab}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="inline-flex items-center gap-2"
                        >
                          {activeTab === 'login' ? 'Welcome Back' : 'Join Samvaad'}
                        </motion.span>
                      </AnimatePresence>
                    </h2>
                    
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setActiveTab('login')}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'login' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white'}`}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => setActiveTab('signup')}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'signup' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white'}`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auth form */}
                <div className="p-4 md:p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'login' ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="relative">
                          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <RiMailLine className="text-gray-500 text-lg md:text-xl" />
                          </div>
                          <input
                            type="email"
                            placeholder="kashikoder@gmail.com"
                            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-gray-900/50 border border-gray-800 rounded-xl md:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm md:text-base"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <RiLock2Line className="text-gray-500 text-lg md:text-xl" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-gray-900/50 border border-gray-800 rounded-xl md:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm md:text-base"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <RiEyeOffLine className="text-lg md:text-xl" /> : <RiEyeLine className="text-lg md:text-xl" />}
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLogin}
                          disabled={isLoading}
                          className="w-full py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl text-white font-semibold text-base md:text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm md:text-base">Authenticating...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm md:text-base">Access Samvaad</span>
                              <RiArrowRightLine className="text-lg md:text-xl" />
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="relative">
                          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <RiUser3Line className="text-gray-500 text-lg md:text-xl" />
                          </div>
                          <input
                            type="email"
                            placeholder="kashikoder@gmail.com"
                            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-gray-900/50 border border-gray-800 rounded-xl md:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm md:text-base"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <RiLock2Line className="text-gray-500 text-lg md:text-xl" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create Samwaad password"
                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-gray-900/50 border border-gray-800 rounded-xl md:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm md:text-base"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <RiEyeOffLine className="text-lg md:text-xl" /> : <RiEyeLine className="text-lg md:text-xl" />}
                          </button>
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                            <RiShieldCheckLine className="text-gray-500 text-lg md:text-xl" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Samwaad password"
                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-gray-900/50 border border-gray-800 rounded-xl md:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm md:text-base"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <RiEyeOffLine className="text-lg md:text-xl" /> : <RiEyeLine className="text-lg md:text-xl" />}
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSignup}
                          disabled={isLoading}
                          className="w-full py-3 md:py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl md:rounded-2xl text-white font-semibold text-base md:text-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm md:text-base">Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm md:text-base">Initialize Samwaad Profile</span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security note - Simplified on mobile */}
                  <div className="mt-6 md:mt-8 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-900/30 border border-gray-800/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm md:text-base lg:text-lg mb-4 md:mb-6 lg:mb-8 max-w-xl text-center md:text-left">
                          "From the timeless flames of Manikarnika to the digital world —  
                          Samvaad keeps connection alive."
                        </p>
                        {/* Mobile-only quick toggle */}
                        <div className="md:hidden text-center">
                          <p className="text-gray-500 text-xs">
                            {activeTab === 'login' ? 'New to Samvaad?' : 'Already have an account?'}{' '}
                            <button
                              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
                              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                              {activeTab === 'login' ? 'Sign Up' : 'Login'}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Add shimmer animation to tailwind config */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        /* Better mobile scrolling */
        @media (max-width: 640px) {
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
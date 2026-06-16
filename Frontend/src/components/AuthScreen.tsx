import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick } from "@/lib/sounds";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthScreenProps {
  onAuth: (user: any) => void;
}

const API_BASE = "http://localhost:8000/api";

const AuthScreen = ({ onAuth }: AuthScreenProps) => {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] =
    useState<any>({});

  // ======================
  // PASSWORD CONDITIONS
  // ======================

  const hasLetter =
    /[A-Za-z]/.test(password);

  const hasNumber =
    /\d/.test(password);

  const hasSpecial =
    /[@$!%*#?&]/.test(password);

  const hasMinLength =
    password.length >= 6;

  const strongPassword =
    hasLetter &&
    hasNumber &&
    hasSpecial &&
    hasMinLength;

  // ======================
  // VALIDATION
  // ======================

  const validate = () => {

    const newErrors: any = {};

    if (!email.includes("@")) {

      newErrors.email =
        "Enter valid email";
    }

    if (isLogin) {

      if (password.length < 4) {

        newErrors.password =
          "Minimum 4 characters";
      }

    } else {

      if (!strongPassword) {

        newErrors.password =
          "Weak password";
      }

      if (!confirmPassword) {

        newErrors.confirm =
          "Confirm your password";

      } else if (
        password !== confirmPassword
      ) {

        newErrors.confirm =
          "Passwords do not match";
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // ======================
  // BUTTON ENABLE
  // ======================

  const isValid =
    isLogin
      ? (
          email.includes("@") &&
          password.length >= 4
        )
      : (
          email.includes("@") &&
          strongPassword &&
          password === confirmPassword
        );

  // ======================
  // SUBMIT
  // ======================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    playClick();

    if (!validate()) return;

    try {

      // LOGIN

      if (isLogin) {

        const res = await fetch(
          `${API_BASE}/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );

        const data = await res.json();

        if (!res.ok) {

          toast.error(
            data.detail ||
            "Login failed ❌"
          );

          return;
        }

        toast.success(
          "Login successful ✅"
        );

        onAuth({
          email,
          token: data.token
        });

        navigate("/home");
      }

      // SIGNUP

      else {

        const res = await fetch(
          `${API_BASE}/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );

        const data = await res.json();

        if (!res.ok) {

          toast.error(
            data.detail ||
            "Registration failed ❌"
          );

          return;
        }

        toast.success(
          "Account created successfully 🎉"
        );

        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setErrors({});

        setShowPassword(false);

        setShowConfirmPassword(false);

        setTimeout(() => {

          setIsLogin(true);

        }, 700);
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Server not reachable ❌"
      );
    }
  };

  // ======================
  // GUEST
  // ======================

  const handleGuest = () => {

    playClick();

    onAuth({
      guest: true,
      token: "guest-token"
    });

    navigate("/home");
  };

  // ======================
  // PASSWORD STATUS ICON
  // ======================

  const PasswordStatusIcon = () => {

    if (!password || isLogin) return null;

    return strongPassword
      ? (
        <CheckCircle
          size={20}
          className="text-green-600"
        />
      )
      : (
        <XCircle
          size={20}
          className="text-red-500"
        />
      );
  };

  // ======================
  // UI
  // ======================

  return (

    <div className="min-h-screen flex items-center justify-center p-4 comic-bg-pattern">

      <motion.div className="w-full max-w-md z-10">

        <h1 className="comic-title text-5xl text-center mb-2">
          COMICWAVE
        </h1>

        <p className="text-center mb-6 font-extrabold text-xl tracking-wide">

          {isLogin
            ? "🦸 Enter the Comic Universe"
            : "🎭 Create Your Hero Identity"}

        </p>

        <div className="comic-card p-8 border-4 rounded-xl">

          {/* TOGGLE */}

          <div className="flex gap-2 mb-8">

            <button
              onClick={() =>
                setIsLogin(true)
              }
              className="flex-1 py-2 comic-btn-primary"
            >
              LOGIN
            </button>

            <button
              onClick={() =>
                setIsLogin(false)
              }
              className="flex-1 py-2 comic-btn-secondary"
            >
              SIGN UP
            </button>

          </div>

          {/* FORM */}

          <AnimatePresence mode="wait">

            <motion.form

              key={
                isLogin
                  ? "login"
                  : "signup"
              }

              onSubmit={handleSubmit}

              initial={{
                x: 100,
                opacity: 0
              }}

              animate={{
                x: 0,
                opacity: 1
              }}

              exit={{
                x: -100,
                opacity: 0
              }}

              transition={{
                duration: 0.3
              }}

              className="space-y-4"
            >

              {/* EMAIL */}

              <input
                type="email"

                placeholder="Email"

                value={email}

                onChange={(e) =>
                  setEmail(e.target.value)
                }

                className="w-full p-3 border-2 border-black rounded text-black"
              />

              {/* PASSWORD */}

              <div className="relative">

                <input

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  placeholder="Password"

                  value={password}

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  className="w-full p-3 border-2 border-black rounded pr-20 text-black"
                />

                {/* VALIDATION ICON */}

                <div className="absolute right-12 top-3">

                  <PasswordStatusIcon />

                </div>

                {/* EYE ICON */}

                {password && (

                  <button
                    type="button"

                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }

                    className="absolute right-3 top-3 text-black"
                  >

                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}

                  </button>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              {!isLogin && (

                <div className="relative">

                  <input

                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }

                    placeholder="Confirm Password"

                    value={confirmPassword}

                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }

                    className="w-full p-3 border-2 border-black rounded pr-10 text-black"
                  />

                  {confirmPassword && (

                    <button
                      type="button"

                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }

                      className="absolute right-3 top-3 text-black"
                    >

                      {showConfirmPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}

                    </button>
                  )}

                </div>
              )}

              {/* BUTTON */}

              <button

                type="submit"

                disabled={!isValid}

                className={`w-full py-2.5 comic-btn-primary ${
                  !isValid
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >

                {isLogin
                  ? "LOGIN 🚀"
                  : "SIGN UP 🎉"}

              </button>

            </motion.form>

          </AnimatePresence>

          {/* GUEST */}

          <button

            onClick={handleGuest}

            className="comic-btn-secondary w-full mt-5 py-2.5"
          >

            Continue as Guest 👤

          </button>

        </div>

      </motion.div>

    </div>
  );
};

export default AuthScreen;
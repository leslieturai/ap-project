import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import Header from "../Header/Header";
import "./signUpIn.css";

import { auth, db } from "../../firebase";
import { ensureUserProfile, getUserProfile } from "../../utils/userProfile";

export default function SignUpIn() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [accountType, setAccountType] = useState("customer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  function redirectByRole(role) {
    if (role === "owner") navigate("/owner-page");
    else navigate("/city-select");
  }

  function friendlyError(e) {
    const code = e?.code || "";
    if (code === "auth/invalid-email") return "Invalid email address.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/email-already-in-use") return "Email already in use.";
    if (code === "auth/user-not-found") return "No account found with that email.";
    if (code === "auth/wrong-password") return "Incorrect password.";
    if (code === "auth/invalid-credential") return "Incorrect email or password.";
    return e?.message || "Something went wrong.";
  }

  async function handleContinue() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setErr("Please enter email and password.");
        return;
      }

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await ensureUserProfile(db, cred.user.uid, {
          role: accountType,
          cityId: "",
        });

        redirectByRole(accountType);
      } else {
        const cred = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        let profile = await getUserProfile(db, cred.user.uid);

        if (!profile) {
          profile = await ensureUserProfile(db, cred.user.uid, {
            role: "customer",
            cityId: "",
          });
        }

        redirectByRole(profile.role);
      }
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email.trim()) {
        setErr("Enter your email first.");
        return;
      }

      await sendPasswordResetEmail(auth, email.trim());
      setMsg("Reset email sent! Check your inbox.");
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <section className="authPage">
        <section id="authSection">
          <div className="auth-container">
            <div className="authHeading">
              <h1>{mode === "login" ? "Welcome Back" : "Create Your Account"}</h1>
              <p>
                {mode === "login"
                  ? "Login to browse restaurants, deals, and events."
                  : "Sign up to start discovering restaurants near you."}
              </p>
            </div>

            <div className="auth-toggle">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
                disabled={loading}
                type="button"
              >
                Login
              </button>

              <button
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
                disabled={loading}
                type="button"
              >
                Sign Up
              </button>
            </div>

            {mode === "signup" && (
              <div className="auth-role">
                <p className="auth-role-title">Choose account type</p>

                <div className="auth-role-buttons">
                  <button
                    className={accountType === "customer" ? "active" : ""}
                    onClick={() => setAccountType("customer")}
                    disabled={loading}
                    type="button"
                  >
                    Customer
                  </button>

                  <button
                    className={accountType === "owner" ? "active" : ""}
                    onClick={() => setAccountType("owner")}
                    disabled={loading}
                    type="button"
                  >
                    Business
                  </button>
                </div>
              </div>
            )}

            <div className="authFields">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <input
                type="password"
                placeholder={mode === "signup" ? "Password (6+ chars)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="primary-btn"
              onClick={handleContinue}
              disabled={loading}
              type="button"
            >
              {loading
                ? "Working..."
                : mode === "login"
                ? "Continue"
                : "Create Account"}
            </button>

            <button
              className="reset-btn"
              onClick={handleResetPassword}
              disabled={loading}
              type="button"
            >
              Forgot / Reset Password
            </button>

            {err && <p className="auth-error">{err}</p>}
            {msg && <p className="auth-success">{msg}</p>}
          </div>
        </section>
      </section>
    </>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import Header from "../Header/Header";
import "./signUpIn.css";

import { auth, db } from "../../firebase";

export default function SignUpIn() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleContinue() {
    setErr("");
    setLoading(true);

    try {
      if (!email || !password) {
        setErr("Please enter email and password.");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        const userRef = doc(db, "users", cred.user.uid);
        const existing = await getDoc(userRef);

        if (!existing.exists()) {
          await setDoc(userRef, {
            role: "user",
            cityId: "",
            createdAt: Date.now(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/city-select");
    } catch (e) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section id="authSection">
        <div className="auth-container">
          <h1>{mode === "login" ? "Login" : "Sign Up"}</h1>

          <div className="auth-toggle">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
              disabled={loading}
            >
              Login
            </button>

            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            className="primary-btn"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? "Working..." : "Continue"}
          </button>

          {err && <p className="auth-error">{err}</p>}

          <hr />

          <section id="preAuthSection">
            <a href="#google">Google</a>
            <a href="#apple">Apple</a>
          </section>
        </div>
      </section>
    </>
  );
}
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole("");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", u.uid));

        if (snap.exists()) {
          const userData = snap.data();
          setRole(userData?.role || "user");
        } else {
          setRole("user");
        }
      } catch {
        setRole("user");
      }
    });

    return () => unsub();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/sign-up-in");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  }

  return (
    <header id="page-header">
      <div className="headerTopRow">
        <div className="headerLeft">
          <Link id="logo" to="/">
            EvoEats
          </Link>
        </div>

        <div className="headerRight">
          <button
            type="button"
            onClick={toggleTheme}
            className="headerBtn themeToggleBtn"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>

          {!user ? (
            <>
              <Link className="headerLinkBtn" to="/sign-up-in">
                Sign-up
              </Link>
              <Link className="headerLinkBtn" to="/sign-up-in">
                Login
              </Link>
            
            </>
          ) : (
            <>
              <Link className="headerLinkBtn" to="/favorites">
                ⭐ Favorites
              </Link>

              {role === "owner" && (
                <Link className="headerLinkBtn" to="/owner-page">
                  Owner Portal
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="headerBtn logoutBtn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="headerBottomRow">
        <NavLink to="/" end className={({ isActive }) => isActive ? "mainNavLink active" : "mainNavLink"}>
          Home
        </NavLink>

        <NavLink to="/deals" className={({ isActive }) => isActive ? "mainNavLink active" : "mainNavLink"}>
          Events & Deals
        </NavLink>
      </nav>
    </header>
  );
}
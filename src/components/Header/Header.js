import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";
import HeaderNav from "../HeaderNav/headerNav";
import "./header.css";

export default function Header() {
  const navigate = useNavigate();
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
        if (snap.exists()) setRole(snap.data()?.role || "user");
        else setRole("user");
      } catch {
        setRole("user");
      }
    });

    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/sign-up-in");
  }

  return (
    <header id="page-header">
      <Link to="/">LOGO</Link>

      <input type="text" placeholder="Search for events" />

      <section id="header-auth">
        {!user ? (
          <>
            <Link to="/sign-up-in">Sign-up</Link>
            <Link to="/sign-up-in">Login</Link>
            <Link to="/sign-up-in">Register your business</Link>
          </>
        ) : (
          <>
            {role === "owner" && <Link to="/owner-page">Owner Portal</Link>}
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </section>

      <HeaderNav />
    </header>
  );
}
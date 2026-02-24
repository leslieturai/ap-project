import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { getUserProfile } from "../../utils/userProfile";
import { useNavigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/sign-up-in");
        return;
      }

      const profile = await getUserProfile(db, u.uid);
      if (!profile) {
        navigate("/sign-up-in");
        return;
      }

      if (profile.role !== role) {
        // redirect based on who they actually are
        if (profile.role === "owner") navigate("/owner-page");
        else navigate("/");
        return;
      }

      setOk(true);
    });

    return () => unsub();
  }, [navigate, role]);

  if (!ok) return <div style={{ padding: 16 }}>Loading...</div>;

  return children;
}
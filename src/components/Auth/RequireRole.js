import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { getUserProfile } from "../../utils/userProfile";
import { useNavigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          navigate("/sign-up-in", { replace: true });
          return;
        }

        let profile = await getUserProfile(db, u.uid);

        if (!profile) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          profile = await getUserProfile(db, u.uid);
        }

        if (!profile) {
          navigate("/sign-up-in", { replace: true });
          return;
        }

        if (profile.role !== role) {
          if (profile.role === "owner") {
            navigate("/owner-page", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
          return;
        }

        setStatus("ok");
      } catch (e) {
        console.error("RequireRole error:", e);
        navigate("/sign-up-in", { replace: true });
      }
    });

    return () => unsub();
  }, [navigate, role]);

  if (status === "loading") {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  return children;
}
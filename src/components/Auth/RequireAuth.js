import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/sign-up-in");
        return;
      }

      setOk(true);
    });

    return () => unsub();
  }, [navigate]);

  if (!ok) return <div style={{ padding: 16 }}>Loading...</div>;

  return children;
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import Header from "../Header/Header";
import "./citySelect.css";

export default function CitySelect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Only one testable city:
  const CALGARY = { id: "calgary", name: "Calgary, Alberta, Canada" };
  const [cityId, setCityId] = useState(CALGARY.id);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/sign-up-in");
        return;
      }
      setUser(u);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data?.cityId) setCityId(data.cityId);
      } else {
        await setDoc(userRef, { role: "user", cityId: "", createdAt: Date.now() });
      }

      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  async function handleSave() {
    if (!user) return;
    setErr("");
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        cityId: cityId, 
      });
      navigate("/"); 
    } catch (e) {
      setErr(e?.message || "Could not save city.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <>
      <Header />
      <section id="citySelectSection">
        <h1>Select your city</h1>
        <p className="city-hint">
          For this class demo, only Calgary is enabled.
        </p>

        <select value={cityId} onChange={(e) => setCityId(e.target.value)} disabled>
          <option value={CALGARY.id}>{CALGARY.name}</option>
        </select>

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Continue"}
        </button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </section>
    </>
  );
}
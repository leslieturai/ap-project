import { useEffect, useState } from "react";
import Header from "../Header/Header";
import VenueCard from "../VenueCard/venueCard";
import { seedCalgaryRestaurants } from "../../seed/seedCalgaryRestaurants";

import "./home.css";
import "../baseStyles.css";

import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [cityId, setCityId] = useState("calgary"); // default
  const [restaurants, setRestaurants] = useState([]);
  const [err, setErr] = useState("");

  // 1) Find user's selected city from Firestore (defaults to Calgary)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          // If not logged in, still allow browsing Calgary-only demo
          setCityId("calgary");
          setLoading(false);
          return;
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));
        const data = userSnap.exists() ? userSnap.data() : null;
        setCityId(data?.cityId || "calgary");
      } catch (e) {
        setErr(e?.message || "Failed to load user city.");
        setCityId("calgary");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // 2) Load restaurants for that city
  useEffect(() => {
    async function loadRestaurants() {
      setErr("");
      try {
        const qRef = query(
          collection(db, "restaurants"),
          where("cityId", "==", cityId)
        );
        const snap = await getDocs(qRef);

        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setRestaurants(rows);
      } catch (e) {
        setErr(e?.message || "Failed to load restaurants.");
      }
    }

    // only run after auth/city load finishes
    if (!loading) loadRestaurants();
  }, [cityId, loading]);

  async function handleSeed() {
    setErr("");
    try {
      const count = await seedCalgaryRestaurants();
      alert(`Seeded ${count} Calgary restaurants`);
      // reload list after seeding
      setCityId("calgary");
    } catch (e) {
      setErr(e?.message || "Seeding failed. Check Firestore rules.");
    }
  }

  return (
    <>
      <Header />
      <section id="homeSection">
        <h1>Popular Bars in {cityId === "calgary" ? "Calgary" : cityId}</h1>

        {/* DEV ONLY: seed button (remove later) */}
        <button onClick={handleSeed}>Seed Calgary Data (DEV)</button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : restaurants.length === 0 ? (
          <p>No restaurants found for this city yet.</p>
        ) : (
          restaurants.map((r) => <VenueCard key={r.id} venue={r} />)
        )}

        
      </section>
    </>
  );
}
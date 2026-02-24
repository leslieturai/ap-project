import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header/Header";
import "./ownerDetails.css";

import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function OwnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [priceLevel, setPriceLevel] = useState("$");
  const [rating, setRating] = useState(0);
  const [about, setAbout] = useState("");
  const [offers, setOffers] = useState("");

  const [hasHappyHour, setHasHappyHour] = useState(false);
  const [hasDailySpecials, setHasDailySpecials] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
        if (!u) navigate("/sign-up-in");
    });

    return () => unsub();
    }, [navigate]);

  useEffect(() => {
    async function loadRestaurant() {
      setLoading(true);
      setErr("");

      try {
        const snap = await getDoc(doc(db, "restaurants", id));
        if (!snap.exists()) {
          setErr("Restaurant not found.");
          return;
        }

        const data = { id: snap.id, ...snap.data() };
        setRestaurant(data);

        setName(data.name || "");
        setAddress(data.address || "");
        setPriceLevel(data.priceLevel || "$");
        setRating(data.rating || 0);
        setAbout(data.about || "");
        setOffers(data.offers || "");
        setHasHappyHour(!!data.hasHappyHour);
        setHasDailySpecials(!!data.hasDailySpecials);
        setHasEvents(!!data.hasEvents);
      } catch (e) {
        setErr("Failed to load restaurant.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadRestaurant();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!restaurant) return;

    setSaving(true);

    try {
      await updateDoc(doc(db, "restaurants", restaurant.id), {
        name,
        address,
        priceLevel,
        rating: Number(rating),
        about,
        offers,
        hasHappyHour,
        hasDailySpecials,
        hasEvents,
        updatedAt: Date.now(),
      });

      setMsg("Saved successfully!");
    } catch (e) {
      setErr("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />

      <section id="ownerDetailSection">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1>Edit Restaurant</h1>

            {err && <p className="errorText">{err}</p>}
            {msg && <p className="successText">{msg}</p>}

            <form onSubmit={handleSave} className="ownerForm">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />

              <label>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} />

              <label>Price Level</label>
              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(e.target.value)}
              >
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>

              <label>Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />

              <label>About</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} />

              <label>Food & Drink Offered</label>
              <textarea value={offers} onChange={(e) => setOffers(e.target.value)} />

              <div className="checkboxGroup">
                <label>
                  <input
                    type="checkbox"
                    checked={hasHappyHour}
                    onChange={(e) => setHasHappyHour(e.target.checked)}
                  />
                  Happy Hour
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={hasDailySpecials}
                    onChange={(e) => setHasDailySpecials(e.target.checked)}
                  />
                  Daily Specials
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={hasEvents}
                    onChange={(e) => setHasEvents(e.target.checked)}
                  />
                  Events
                </label>
              </div>

              <div className="buttonRow">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/owner-page")}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </>
  );
}
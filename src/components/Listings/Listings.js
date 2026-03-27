import { useEffect, useMemo, useState } from "react";
import Header from "../Header/Header";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import "./listings.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Listings() {
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [day, setDay] = useState(new Date().getDay()); 
  const [type, setType] = useState("event"); 

  useEffect(() => {
    async function load() {
      setErr("");
      setLoading(true);

      try {
        // restaurants in calgary
        const rSnap = await getDocs(
          query(collection(db, "restaurants"), where("cityId", "==", "calgary"))
        );
        const rData = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRestaurants(rData);

        // listings in calgary
        const lSnap = await getDocs(
          query(collection(db, "listings"), where("cityId", "==", "calgary"))
        );
        const lData = lSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(lData);
      } catch (e) {
        setErr(e?.message || "Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const restaurantById = useMemo(() => { // Getting venues by id
    const map = new Map();
    restaurants.forEach((r) => map.set(r.id, r));
    return map;
  }, [restaurants]);

  const filtered = useMemo(() => { // Handling filtering
    return items
      .filter((i) => i.dayOfWeek === day)
      .filter((i) => i.type === type)
      .map((i) => ({
        ...i,
        restaurant: restaurantById.get(i.restaurantId),
      }))
      .filter((i) => i.restaurant); 
  }, [items, day, type, restaurantById]);

  return (
    <>
      <Header />

      <section className="listingsPage">
        <h1>Calgary {type === "event" ? "Events" : type === "happyHour" ? "Happy Hours" : "Daily Specials"}</h1>

        <div className="controlsRow">
          <div className="segmented">
            <button className={type === "event" ? "active" : ""} onClick={() => setType("event")}>
              Events
            </button>
            <button className={type === "happyHour" ? "active" : ""} onClick={() => setType("happyHour")}>
              Happy Hour
            </button>
            <button className={type === "dailySpecial" ? "active" : ""} onClick={() => setType("dailySpecial")}>
              Daily Specials
            </button>
          </div>

          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAYS.map((d, idx) => (
              <option key={d} value={idx}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <p className="errorText">{err}</p>
        ) : filtered.length === 0 ? (
          <p>No items found for {DAYS[day]}.</p>
        ) : (
          <div className="listingsGrid">
            {filtered.map((i) => (
              <div key={i.id} className="listingCard">
                <h3>{i.title}</h3>
                <p className="muted">
                  {i.startTime && i.endTime ? `${i.startTime}–${i.endTime}` : ""}
                </p>
                <p>{i.description}</p>

                <hr />

                <p className="restaurantName">{i.restaurant?.name}</p>
                <p className="muted">{i.restaurant?.address}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
import { useEffect, useMemo, useState } from "react";
import Header from "../Header/Header";
import "./deals.css";

import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function Deals() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [day, setDay] = useState("All");
  const [showEvents, setShowEvents] = useState(true);
  const [showHappyHour, setShowHappyHour] = useState(true);
  const [showSpecials, setShowSpecials] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      setLoading(true);

      try {
        const q = query(
          collection(db, "restaurants"),
          where("cityId", "==", "calgary")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVenues(data);
      } catch (e) {
        setErr(e?.message || "Failed to load deals.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const items = useMemo(() => {
    const list = [];

    for (const v of venues) {
      const name = v.name || "";
      const address = v.address || "";

      // Happy hour item
      if (v.hasHappyHour && v.happyHourDetails) {
        list.push({
          type: "Happy Hour",
          venueId: v.id,
          venueName: name,
          address,
          day: "All", 
          title: "Happy Hour",
          time: "",
          details: v.happyHourDetails,
        });
      }

      // Daily specials item
      if (v.hasDailySpecials && v.dailySpecialsDetails) {
        list.push({
          type: "Daily Specials",
          venueId: v.id,
          venueName: name,
          address,
          day: "All",
          title: "Daily Specials",
          time: "",
          details: v.dailySpecialsDetails,
        });
      }

      // Events items
      if (v.hasEvents && Array.isArray(v.events)) {
        for (const ev of v.events) {
          list.push({
            type: "Event",
            venueId: v.id,
            venueName: name,
            address,
            day: ev?.day || "All",
            title: ev?.title || "Event",
            time: ev?.time || "",
            details: ev?.details || "",
          });
        }
      }
    }

    return list;
  }, [venues]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return items.filter((it) => {
      if (!showEvents && it.type === "Event") return false;
      if (!showHappyHour && it.type === "Happy Hour") return false;
      if (!showSpecials && it.type === "Daily Specials") return false;

      if (day !== "All") {
        if (it.day !== "All" && it.day !== day) return false;
      }

      if (s) {
        const hay = `${it.venueName} ${it.title}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      return true;
    });
  }, [items, day, showEvents, showHappyHour, showSpecials, search]);

  function clearFilters() {
    setDay("All");
    setShowEvents(true);
    setShowHappyHour(true);
    setShowSpecials(true);
    setSearch("");
  }

  return (
    <>
      <Header />

      <section className="dealsPage">

        <div id="home-colour-block">
            <h1>Events & Deals (Calgary)</h1>
            <div className="dealsControls">
            <input
              className="searchInput"
              type="text"
              placeholder="Search by venue or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="daySelect"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="All">All days</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              type="button"
              className={showEvents ? "filterBtn active" : "filterBtn"}
              onClick={() => setShowEvents((p) => !p)}
            >
              Events
            </button>

            <button
              type="button"
              className={showHappyHour ? "filterBtn active" : "filterBtn"}
              onClick={() => setShowHappyHour((p) => !p)}
            >
              Happy Hour
            </button>

            <button
              type="button"
              className={showSpecials ? "filterBtn active" : "filterBtn"}
              onClick={() => setShowSpecials((p) => !p)}
            >
              Daily Specials
            </button>

            <button type="button" className="filterBtn" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <p className="errorText">{err}</p>
        ) : filtered.length === 0 ? (
          <p>No matches.</p>
        ) : (
          <div className="dealsList">
            {filtered.map((it, idx) => (
              <div className="dealCard" key={`${it.venueId}-${it.type}-${idx}`}>
                <div className="dealTop">
                  <span className="dealTag">{it.type}</span>
                  {it.day && <span className="dealDay">{it.day}</span>}
                  {it.time && <span className="dealTime">{it.time}</span>}
                </div>

                <h3 className="dealTitle">{it.title}</h3>

                <p className="dealVenue">
                  <strong>{it.venueName}</strong>
                  {it.address ? ` — ${it.address}` : ""}
                </p>

                {it.details && <p className="dealDetails">{it.details}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
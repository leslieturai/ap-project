import { useEffect, useMemo, useState } from "react";
import Header from "../Header/Header";
import VenueCard from "../VenueCard/venueCard";
import "./home.css";

import "../baseStyles.css";

import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// import { seedCalgaryRestaurants } from "../../seed/seedCalgaryRestaurants";

export default function Home() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [filterHappyHour, setFilterHappyHour] = useState(false);
  const [filterDailySpecials, setFilterDailySpecials] = useState(false);
  const [filterEvents, setFilterEvents] = useState(false);

  async function loadCalgaryRestaurants() {
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
      setErr(e?.message || "Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  }

  // Run once on page load
  useEffect(() => {
    loadCalgaryRestaurants();
  }, []);

  // async function handleSeed() {
  //   setErr("");
  //   setLoading(true);

  //   try {
  //     const count = await seedCalgaryRestaurants();
  //     console.log("Seeded:", count);

  //     // reload restaurants after seeding
  //     await loadCalgaryRestaurants();
  //   } catch (e) {
  //     setErr(e?.message || "Seeding failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return venues.filter((v) => {
      // search by name
      if (s && !(v.name || "").toLowerCase().includes(s)) return false;

      // filters
      if (filterHappyHour && !v.hasHappyHour) return false;
      if (filterDailySpecials && !v.hasDailySpecials) return false;
      if (filterEvents && !v.hasEvents) return false;

      return true;
    });
  }, [venues, search, filterHappyHour, filterDailySpecials, filterEvents]);

  function clearFilters() {
    setSearch("");
    setFilterHappyHour(false);
    setFilterDailySpecials(false);
    setFilterEvents(false);
  }

  return (
    <>
      <Header />

      <section id="homeSection">
        <h1>Calgary Restaurants</h1>

        {/* TEMP BUTTON: Click once to seed Firestore
        <button
          type="button"
          className="filterBtn"
          onClick={handleSeed}
          disabled={loading}
          style={{ marginBottom: "1rem" }}
        >
          {loading ? "Working..." : "Seed Calgary Restaurants"}
        </button> */}

        <div className="filterRow">
          <input
            className="searchInput"
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className={filterHappyHour ? "filterBtn active" : "filterBtn"}
            onClick={() => setFilterHappyHour((p) => !p)}
          >
            Happy Hour
          </button>

          <button
            type="button"
            className={filterDailySpecials ? "filterBtn active" : "filterBtn"}
            onClick={() => setFilterDailySpecials((p) => !p)}
          >
            Daily Specials
          </button>

          <button
            type="button"
            className={filterEvents ? "filterBtn active" : "filterBtn"}
            onClick={() => setFilterEvents((p) => !p)}
          >
            Events
          </button>

          <button type="button" className="filterBtn" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <p className="errorText">{err}</p>
        ) : filtered.length === 0 ? (
          <p>No restaurants match your search/filters.</p>
        ) : (
          <div className="venueList">
            {filtered.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
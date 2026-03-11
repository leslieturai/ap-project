import { useEffect, useMemo, useState } from "react";
import Header from "../Header/Header";
import VenueCard from "../VenueCard/venueCard";
import "./home.css";
import "../baseStyles.css";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [city, setCity] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [sortNewest, setSortNewest] = useState(false);

  const [search, setSearch] = useState("");
  const [filterHappyHour, setFilterHappyHour] = useState(false);
  const [filterDailySpecials, setFilterDailySpecials] = useState(false);
  const [filterEvents, setFilterEvents] = useState(false);

  useEffect(() => {
    async function loadUserCityAndRestaurants() {
      setErr("");
      setLoading(true);

      try {
        const user = auth.currentUser;

        if (!user) {
          setErr("You must be logged in to view restaurants.");
          setVenues([]);
          return;
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
          setErr("User profile not found.");
          setVenues([]);
          return;
        }

        const userData = userSnap.data();
        const selectedCity = userData?.cityId || "";

        setCity(selectedCity);

        if (!selectedCity) {
          setErr("No city selected.");
          setVenues([]);
          return;
        }

        const q = query(
          collection(db, "restaurants"),
          where("cityId", "==", selectedCity)
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

    loadUserCityAndRestaurants();
  }, []);

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  function handleNearMe() {
    if (sortByDistance) {
      setSortByDistance(false);
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortByDistance(true);
      },
      () => {
        alert("Could not get your location.");
      }
    );
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    let results = venues.filter((v) => {
      if (s && !(v.name || "").toLowerCase().includes(s)) return false;
      if (filterHappyHour && !v.hasHappyHour) return false;
      if (filterDailySpecials && !v.hasDailySpecials) return false;
      if (filterEvents && !v.hasEvents) return false;
      return true;
    });

    if (sortByDistance && userLocation) {
      results = results
        .map((v) => {
          const lat = Number(v?.coordinates?.[0]);
          const lng = Number(v?.coordinates?.[1]);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return { ...v, distanceKm: Number.POSITIVE_INFINITY };
          }

          const distanceKm = getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );

          return {
            ...v,
            distanceKm,
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      results = results.map((v) => {
        const { distanceKm, ...rest } = v;
        return rest;
      });
    }

    if (sortNewest) {
      results = [...results].sort((a, b) => {
        const aDate = a.createdAt?.seconds || 0;
        const bDate = b.createdAt?.seconds || 0;
        return bDate - aDate;
      });
    }

    return results;
  }, [
    venues,
    search,
    filterHappyHour,
    filterDailySpecials,
    filterEvents,
    sortByDistance,
    userLocation,
    sortNewest,
  ]);

  function clearFilters() {
    setSearch("");
    setFilterHappyHour(false);
    setFilterDailySpecials(false);
    setFilterEvents(false);
    setSortByDistance(false);
    setSortNewest(false);
    setUserLocation(null);
  }

  const cityTitle = city
    ? city.charAt(0).toUpperCase() + city.slice(1)
    : "";

  return (
    <>
      <Header />

      <section id="homeSection">
        <h1>{cityTitle ? `Restaurants in ${cityTitle}` : "Restaurants"}</h1>

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
            className={sortByDistance ? "filterBtn active" : "filterBtn"}
            onClick={handleNearMe}
          >
            Near Me
          </button>

          <button
            type="button"
            className={sortNewest ? "filterBtn active" : "filterBtn"}
            onClick={() => setSortNewest((p) => !p)}
          >
            Newest
          </button>

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
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./deals.css";

import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Deals() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  const filteredVenues = useMemo(() => {
    const s = search.trim().toLowerCase();

    return venues.filter((venue) => {
      const name = venue?.name || "";
      const address = venue?.address || "";

      const hasMatchingHappyHour =
        showHappyHour && venue?.hasHappyHour && !!venue?.happyHourDetails;

      const hasMatchingSpecials =
        showSpecials && venue?.hasDailySpecials && !!venue?.dailySpecialsDetails;

      const venueEvents = Array.isArray(venue?.events) ? venue.events : [];

      const matchingEvents =
        showEvents
          ? venueEvents.filter((ev) => {
              if (day === "All") return true;
              return (ev?.day || "All") === day;
            })
          : [];

      const hasMatchingEvents = matchingEvents.length > 0;

      if (!hasMatchingHappyHour && !hasMatchingSpecials && !hasMatchingEvents) {
        return false;
      }

      if (s) {
        const eventText = venueEvents
          .map((ev) => `${ev?.title || ""} ${ev?.details || ""}`)
          .join(" ")
          .toLowerCase();

        const hay = `${name} ${address} ${venue?.happyHourDetails || ""} ${venue?.dailySpecialsDetails || ""} ${eventText}`.toLowerCase();

        if (!hay.includes(s)) return false;
      }

      return true;
    });
  }, [venues, day, showEvents, showHappyHour, showSpecials, search]);

  function clearFilters() {
    setDay("All");
    setShowEvents(true);
    setShowHappyHour(true);
    setShowSpecials(true);
    setSearch("");
  }

  function handleCardClick(venueId) {
    navigate(`/details/${venueId}`);
  }

  function handleCardKeyDown(e, venueId) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/details/${venueId}`);
    }
  }

  return (
    <>
      <Header />

      <section className="dealsPage">
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
              <option key={d} value={d}>
                {d}
              </option>
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

          <button
            type="button"
            className="filterBtn clearBtn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <p className="errorText">{err}</p>
        ) : filteredVenues.length === 0 ? (
          <p>No matches.</p>
        ) : (
          <div className="dealGrid">
            {filteredVenues.map((venue) => {
              const matchingEvents =
                showEvents && Array.isArray(venue?.events)
                  ? venue.events.filter((ev) => {
                      if (day === "All") return true;
                      return (ev?.day || "All") === day;
                    })
                  : [];

              return (
                <div
                  className="venueDealsCard clickableCard"
                  key={venue.id}
                  onClick={() => handleCardClick(venue.id)}
                  onKeyDown={(e) => handleCardKeyDown(e, venue.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${venue.name}`}
                >
                  <div className="venueDealsHeader">
                    <div>
                      <h2 className="venueDealsTitle">{venue.name}</h2>
                      {venue.address && (
                        <p className="venueDealsAddress">{venue.address}</p>
                      )}
                    </div>

                    <div className="venueDealsBadges">
                      {showHappyHour &&
                        venue?.hasHappyHour &&
                        venue?.happyHourDetails && (
                          <span className="dealTag happyTag">Happy Hour</span>
                        )}

                      {showSpecials &&
                        venue?.hasDailySpecials &&
                        venue?.dailySpecialsDetails && (
                          <span className="dealTag specialTag">Daily Specials</span>
                        )}

                      {showEvents && matchingEvents.length > 0 && (
                        <span className="dealTag dealsEventTag">
                          {matchingEvents.length} Event
                          {matchingEvents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="venueDealsBody">
                    {showHappyHour &&
                      venue?.hasHappyHour &&
                      venue?.happyHourDetails && (
                        <div className="dealSectionBlock">
                          <h3>Happy Hour</h3>
                          <p>{venue.happyHourDetails}</p>
                        </div>
                      )}

                    {showSpecials &&
                      venue?.hasDailySpecials &&
                      venue?.dailySpecialsDetails && (
                        <div className="dealSectionBlock">
                          <h3>Daily Specials</h3>
                          <p>{venue.dailySpecialsDetails}</p>
                        </div>
                      )}

                    {showEvents && matchingEvents.length > 0 && (
                      <div className="dealSectionBlock">
                        <h3>Events</h3>
                        <ul className="venueEventsList">
                          {matchingEvents.map((ev, idx) => (
                            <li key={idx}>
                              <strong>{ev?.title || "Event"}</strong>
                              {(ev?.day || ev?.time) && (
                                <span>
                                  {" "}
                                  — {ev?.day || "Day TBD"}
                                  {ev?.time ? ` at ${ev.time}` : ""}
                                </span>
                              )}
                              {ev?.details && <div>{ev.details}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="venueDealsFooter">View restaurant →</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./details.css";

import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import MapMarker from "../MapMarker/mapMarker";

const dayLabelMap = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const dayKeyByIndex = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    async function loadVenue() {
      setErr("");
      setLoading(true);

      try {
        if (!id) {
          setErr("No restaurant id provided.");
          setVenue(null);
          return;
        }

        const snap = await getDoc(doc(db, "restaurants", id));
        if (!snap.exists()) {
          setErr("Restaurant not found.");
          setVenue(null);
          return;
        }

        setVenue({ id: snap.id, ...snap.data() });
      } catch (e) {
        setErr(e?.message || "Failed to load restaurant details.");
        setVenue(null);
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id]);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user || !id) {
      setIsFavorite(false);
      return;
    }

    const favRef = doc(db, "users", user.uid, "favorites", id);

    const unsubscribe = onSnapshot(favRef, (snap) => {
      setIsFavorite(snap.exists());
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    async function loadUserRating() {
      const user = auth.currentUser;

      if (!user || !id) {
        setUserRating(0);
        return;
      }

      try {
        const ratingRef = doc(db, "restaurants", id, "ratings", user.uid);
        const snap = await getDoc(ratingRef);

        if (snap.exists()) {
          setUserRating(Number(snap.data().rating) || 0);
        } else {
          setUserRating(0);
        }
      } catch (e) {
        console.error("Failed to load user rating:", e);
      }
    }

    loadUserRating();
  }, [id]);

  async function toggleFavorite() {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    try {
      const favRef = doc(db, "users", user.uid, "favorites", id);

      if (isFavorite) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          restaurantId: id,
          name: venue?.name || "",
          address: venue?.address || "",
          cityId: venue?.cityId || "",
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error("Failed to update favorite:", e);
      alert("Could not update favorite.");
    }
  }

  async function handleShare() {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: venue?.name || "Restaurant",
          text: `Check out ${venue?.name || "this restaurant"} on EvoEats!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Restaurant link copied to clipboard!");
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  }

  async function handleRate(newRating) {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to rate restaurants.");
      return;
    }

    setRatingLoading(true);

    try {
      const ratingRef = doc(db, "restaurants", id, "ratings", user.uid);

      await setDoc(ratingRef, {
        rating: newRating,
        createdAt: Date.now(),
      });

      setUserRating(newRating);

      const ratingsRef = collection(db, "restaurants", id, "ratings");
      const ratingsSnap = await getDocs(ratingsRef);

      const ratings = ratingsSnap.docs.map((d) => Number(d.data().rating) || 0);
      const ratingCount = ratings.length;
      const averageRating =
        ratingCount > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratingCount
          : 0;

      await updateDoc(doc(db, "restaurants", id), {
        rating: Number(averageRating.toFixed(1)),
        ratingCount,
      });

      setVenue((prev) =>
        prev
          ? {
              ...prev,
              rating: Number(averageRating.toFixed(1)),
              ratingCount,
            }
          : prev
      );
    } catch (e) {
      console.error("Failed to save rating:", e);
      alert("Could not save rating.");
    } finally {
      setRatingLoading(false);
    }
  }

  function busyAtRandom(min, max) {
    const tempNum = Math.floor(Math.random() * (max - min)) + min;
    if (tempNum === 1) return "Empty";
    if (tempNum === 2) return "Not too busy";
    return "Packed";
  }

  function formatTime(timeValue) {
    if (!timeValue) return "";
    const [hourStr, minute] = timeValue.split(":");
    let hour = Number(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  function toMinutes(timeValue) {
    if (!timeValue || !timeValue.includes(":")) return null;
    const [hourStr, minuteStr] = timeValue.split(":");
    return Number(hourStr) * 60 + Number(minuteStr);
  }

  function getOpenStatus(hoursObj) {
    if (!hoursObj || typeof hoursObj !== "object") {
      return { label: "Hours unavailable", className: "statusUnknown" };
    }

    const now = new Date();
    const todayKey = dayKeyByIndex[now.getDay()];
    const todayHours = hoursObj[todayKey];

    if (!todayHours || todayHours.closed) {
      return { label: "Closed", className: "statusClosed" };
    }

    const openMinutes = toMinutes(todayHours.open);
    const closeMinutes = toMinutes(todayHours.close);

    if (openMinutes === null || closeMinutes === null) {
      return { label: "Hours unavailable", className: "statusUnknown" };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isOpen = false;

    if (closeMinutes > openMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else if (closeMinutes < openMinutes) {
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    } else {
      isOpen = false;
    }

    if (isOpen) {
      return { label: "Open Now", className: "statusOpen" };
    }

    return { label: "Closed", className: "statusClosed" };
  }

  const events = useMemo(
    () => (Array.isArray(venue?.events) ? venue.events : []),
    [venue]
  );

  const mapCenter = useMemo(() => {
    const lat = Number(venue?.coordinates?.[0]);
    const lng = Number(venue?.coordinates?.[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { lat: 51.0447, lng: -114.0719 };
    }

    return { lat, lng };
  }, [venue]);

  const openStatus = getOpenStatus(venue?.hours);

  return (
    <>
      <Header />

      <section id="detailSection">
        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <section className="detailsCard">
            <p className="errorText">{err}</p>
            <button
              className="backBtn"
              type="button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </section>
        ) : (
          <>
            <section className="detailsHeroCard">
              <div className="detailsHeroContent">
                <div className="detailsHeroText">
                  <p className="detailsEyebrow">Restaurant</p>
                  <h1>{venue?.name || "Restaurant"}</h1>

                  <div className="detailsTopMeta">
                    {venue?.foodCategory && (
                      <span className="detailsPill">
                        {venue.foodCategory.charAt(0).toUpperCase() +
                          venue.foodCategory.slice(1)}
                      </span>
                    )}

                    {venue?.priceLevel && (
                      <span className="detailsPill pricePill">{venue.priceLevel}</span>
                    )}

                    {typeof venue?.rating === "number" && (
                      <span className="detailsPill">
                        {venue.rating}
                        {venue?.ratingCount ? ` (${venue.ratingCount})` : ""}
                      </span>
                    )}

                    <span className={`detailsPill openStatusPill ${openStatus.className}`}>
                      {openStatus.label}
                    </span>
                  </div>

                  {venue?.address && (
                    <p className="detailsAddressLine">{venue.address}</p>
                  )}
                </div>

                <div className="detailsTopActions">
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className="favoriteBtn"
                  >
                    {isFavorite ? "★ Remove Favorite" : "☆ Add to Favorites"}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="shareBtn"
                  >
                    Share
                  </button>
                </div>
              </div>

              {venue?.imageUrl && (
                <img
                  src={venue.imageUrl}
                  alt={venue.name || "Restaurant"}
                  className="detailsHeroImage"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </section>

            <section className="detailsGridTwo">
              <section className="detailsCard">
                <h2>About</h2>
                {venue?.about ? (
                  <p>{venue.about}</p>
                ) : (
                  <p>No description available yet.</p>
                )}
              </section>

              <section className="detailsCard">
                <h2>Contact</h2>

                <p>
                  <strong>Address:</strong> {venue?.address || "Not provided"}
                </p>

                {venue?.phone && (
                  <p>
                    <strong>Phone:</strong> {venue.phone}
                  </p>
                )}

                {venue?.website && (
                  <p>
                    <strong>Website:</strong>{" "}
                    <a href={venue.website} target="_blank" rel="noreferrer">
                      Visit Website
                    </a>
                  </p>
                )}
              </section>
            </section>

            <section className="detailsGridTwo">
              <section className="detailsCard">
                <h2>Your Rating</h2>
                <div className="ratingButtons">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={
                        userRating === num
                          ? "ratingBtn activeRating"
                          : "ratingBtn"
                      }
                      onClick={() => handleRate(num)}
                      disabled={ratingLoading}
                    >
                      {num}★
                    </button>
                  ))}
                </div>
              </section>

              {venue?.hours &&
                typeof venue.hours === "object" &&
                !Array.isArray(venue.hours) && (
                  <section className="detailsCard hoursDisplaySection">
                    <div className="hoursHeaderRow">
                      <h2>Hours</h2>
                      <span className={`hoursStatusBadge ${openStatus.className}`}>
                        {openStatus.label}
                      </span>
                    </div>

                    <div className="hoursGrid">
                      {Object.entries(venue.hours).map(([day, value]) => (
                        <p key={day}>
                          <strong>{dayLabelMap[day] || day}:</strong>{" "}
                          {value?.closed
                            ? "Closed"
                            : value?.open && value?.close
                            ? `${formatTime(value.open)} - ${formatTime(
                                value.close
                              )}`
                            : "Not provided"}
                        </p>
                      ))}
                    </div>
                  </section>
                )}
            </section>

            <section className="detailsCard">
              <h2>Deals & Events</h2>

              {venue?.offers && (
                <p className="detailsIntroText">
                  <strong>Offers:</strong> {venue.offers}
                </p>
              )}

              <div className="detailsDealsGrid">
                <div className="dealMiniCard">
                  <h3>Happy Hour</h3>
                  {venue?.hasHappyHour ? (
                    <p>
                      {venue?.happyHourDetails ||
                        "Happy hour is available, but details were not added yet."}
                    </p>
                  ) : (
                    <p>No happy hour listed.</p>
                  )}
                </div>

                <div className="dealMiniCard">
                  <h3>Daily Specials</h3>
                  {venue?.hasDailySpecials ? (
                    <p>
                      {venue?.dailySpecialsDetails ||
                        "Daily specials are available, but details were not added yet."}
                    </p>
                  ) : (
                    <p>No daily specials listed.</p>
                  )}
                </div>
              </div>

              <div className="eventsBlock">
                <h3>Events</h3>
                {venue?.hasEvents ? (
                  events.length === 0 ? (
                    <p>Events are available, but none were added yet.</p>
                  ) : (
                    <ul className="detailsEventsList">
                      {events.map((ev, idx) => (
                        <li key={idx}>
                          <strong>{ev.title || "Event"}</strong>
                          {(ev.day || ev.time) && (
                            <span>
                              {" "}
                              — {ev.day || "Day TBD"}
                              {ev.time ? ` at ${ev.time}` : ""}
                            </span>
                          )}
                          {ev.details && <div>{ev.details}</div>}
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p>No events listed.</p>
                )}
              </div>
            </section>

            <section className="detailsCard" id="mapSection">
              <h2>Location</h2>
              <p>{venue?.address || "Address not provided."}</p>

              <div className="mapWrap">
                <APIProvider apiKey="AIzaSyDy-6rkV4XH2UXvyubcwT3PLH9H-Hef0vI">
                  <Map
                    defaultZoom={15}
                    defaultCenter={mapCenter}
                    mapId={"8e0468e996c5bdf3b9dbf482"}
                    style={{
                      width: "100%",
                      height: "350px",
                      borderRadius: "12px",
                    }}
                  >
                    <AdvancedMarker position={mapCenter}>
                      <MapMarker frequency={busyAtRandom(1, 3)} />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              </div>
            </section>
          </>
        )}
      </section>
    </>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./details.css";

import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

// Uncomment when enabling Google Maps
// import {
//   APIProvider,
//   Map,
//   AdvancedMarker,
//   Pin,
//   InfoWindow,
// } from "@vis.gl/react-google-maps";

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // For Google Maps popup (uncomment when enabling map)
  // const [open, setOpen] = useState(false);

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

  return (
    <>
      <Header />

      <section id="detailSection">
        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <section>
            <p className="errorText">{err}</p>
            <button className="backBtn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </section>
        ) : (
          <>
            <h1>{venue?.name}</h1>

            <section id="imageSection">
              <p>Images here</p>
            </section>

            <section className="venueRankings">
              <p className="frequencyStatus">
                {venue?.hasEvents ? "Events" : "No events"}
              </p>
              <p className="venueCost">{venue?.priceLevel || "$"}</p>
              <p className="venueScore">{venue?.rating || "—"}</p>
            </section>

            <section id="venueDesc">
              <h2>About</h2>
              <p>{venue?.about || "No description yet."}</p>
              {venue?.address && (
                <p>
                  <strong>Address:</strong> {venue.address}
                </p>
              )}
            </section>

            <section id="offersSection">
              <hr />
              <h2>Food & Drink Offered</h2>
              <p>{venue?.offers || "No offers listed yet."}</p>
              <hr />
            </section>

            <section id="mapSection">
              <h2>Location</h2>
              <p>{venue?.address || "Address not provided."}</p>

              {/* 
                Uncomment this entire block when enabling Google Maps.
                Remember:
                1) npm install @vis.gl/react-google-maps
                2) uncomment imports at top
                3) uncomment open/setOpen state
                4) add API key below
              */}

              {/*
              <APIProvider apiKey="YOUR_GOOGLE_MAPS_KEY">
                <Map
                  defaultZoom={13}
                  defaultCenter={{ lat: 51.0447, lng: -114.0719 }} // Calgary
                  mapId="YOUR_MAP_ID"
                >
                  <AdvancedMarker
                    position={{ lat: 51.0447, lng: -114.0719 }}
                    onClick={() => setOpen(true)}
                  >
                    <Pin />
                  </AdvancedMarker>

                  {open && (
                    <InfoWindow
                      position={{ lat: 51.0447, lng: -114.0719 }}
                      onCloseClick={() => setOpen(false)}
                    >
                      <p>{venue?.name}</p>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
              */}

              <hr />
            </section>
          </>
        )}
      </section>
    </>
  );
}
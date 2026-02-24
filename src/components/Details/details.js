import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./details.css";

import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

import {APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import MapMarker from "../MapMarker/mapMarker";



export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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


      /* Generate random busyness */
    function busyAtRandom(min, max) {
        let tempNum = Math.floor(Math.random() * (max - min) ) + min;
        if (tempNum === 1) {
            return "Empty"
        } if (tempNum === 2) {
            return "Not too busy"
        } if (tempNum === 3) {
            return "Packed"
        }
    }


  return (
    <>
      <Header />

      <section id="detailSection">
        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <section>
            <p className="errorText">{err}</p>
            <button className="backBtn" type="button" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </section>
        ) : (
          <>
            {/* Title */}
            <h1>{venue?.name || "Restaurant"}</h1>

            {/* Address */}
{/*             <section id="venueDesc">
              
            </section> */}

            <section id="offersSection">
              <hr />
              <h2>What’s Available</h2>

              <ul style={{ marginTop: "0.5rem" }}>
                {venue?.hasHappyHour ? <li>Happy Hour</li> : <li>No Happy Hour listed</li>}
                {venue?.hasDailySpecials ? <li>Daily Specials</li> : <li>No Daily Specials listed</li>}
                {venue?.hasEvents ? <li>Events</li> : <li>No Events listed</li>}
              </ul>

              <hr />
            </section>

            {(venue?.about || venue?.offers || venue?.rating || venue?.priceLevel) && (
              <section>
                <h2>More Info</h2>
                {venue?.about && (
                  <p>
                    <strong>About:</strong> {venue.about}
                    
                  </p>
                )}
                {venue?.offers && (
                  <p>
                    <strong>Offers:</strong> {venue.offers}
                  </p>
                )}
                {venue?.rating && (
                  <p>
                    <strong>Rating:</strong> {venue.rating}
                  </p>
                )}
                {venue?.priceLevel && (
                  <p>
                    <strong>Price:</strong> <strong className="venuePCost"> {venue.priceLevel}</strong> 
                  </p>
                )}
              </section>
            )}

            <section id="mapSection">
              <hr />
              <h2>Location</h2>
              <p>{venue?.address || "Address not provided."}</p>
              <hr></hr>
               <APIProvider apiKey="AIzaSyDy-6rkV4XH2UXvyubcwT3PLH9H-Hef0vI">
                    <Map
                        defaultZoom={15}
                        defaultCenter={{ lat: Number(venue.coordinates[0]), lng: Number(venue.coordinates[1])}}
                        mapId={"8e0468e996c5bdf3b9dbf482"}
                        >
                        <AdvancedMarker position={{ lat: Number(venue.coordinates[0]), lng: Number(venue.coordinates[1]) }}>
                            <MapMarker frequency={busyAtRandom(1, 3)}/>
                        </AdvancedMarker>
                    </Map>
                </APIProvider>
              
            </section>
          </>
        )}
      </section>
    </>
  );
}
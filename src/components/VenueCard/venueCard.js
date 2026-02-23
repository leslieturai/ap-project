import "./venueCard.css";
import { Link } from "react-router-dom";

export default function VenueCard({ venue }) {
  // fallback so it doesn't crash if venue is missing
  const v = venue || {};

  return (
    <section className="venueCard">
      <p>Img</p>

      <p className="venueName">
        {/* Using doc id for details route */}
        <Link to={`/details/${v.id || ""}`}>{v.name || "Unknown venue"}</Link>
      </p>

      <div className="venueRankings">
        {/* Simple status based on flags (you can improve later) */}
        <p className="frequencyStatus">
          {v.hasEvents ? "Events" : "No events"}
        </p>

        <p className="venueCost">{v.priceLevel || "$"}</p>

        <p className="venueScore">{v.rating || "—"}</p>
      </div>

      {/* Optional: show address */}
      {v.address && <p style={{ marginTop: 6 }}>{v.address}</p>}
    </section>
  );
}
import { Link } from "react-router-dom";
import "./venueCard.css";

export default function OwnerVenueCard({ restaurant, onEdit }) {
  if (!restaurant) return null;

  return (
    <section className="venueCard">
      <p>Img</p>

      <p className="venueName">
        <Link to={`/details/${restaurant.id}`}>{restaurant.name}</Link>
      </p>

      <p className="venueAddress">{restaurant.address}</p>

      <div className="venueRankings">
        <p className="frequencyStatus">
          {restaurant.hasEvents ? "Has Events" : "No Events"}
        </p>
        <p className="venueCost">{restaurant.priceLevel || "$"}</p>
        <p className="venueScore">
          {typeof restaurant.rating === "number" ? restaurant.rating : "—"}
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <Link to={`/details/${restaurant.id}`}>
          <button type="button">View</button>
        </Link>

        <button type="button" onClick={() => onEdit?.(restaurant.id)}>
          Edit
        </button>
      </div>
    </section>
  );
}
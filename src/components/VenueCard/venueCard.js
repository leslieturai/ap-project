import { Link } from "react-router-dom";
import "./venueCard.css";

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export default function VenueCard({ venue }) {
  if (!venue) return null;

  return (
    <div className="venueCard">
      <Link className="venueName" to={`/details/${venue.id}`}>
        {venue.name}
      </Link>

      <p className="venueAddress">{venue.address}</p>

      {Number.isFinite(venue?.distanceKm) && (
        <p className="venueDistance">{venue.distanceKm.toFixed(1)} km away</p>
      )}

      {venue?.foodCategory && (
        <p className="venueCategory">
          {venue.foodCategory.charAt(0).toUpperCase() + venue.foodCategory.slice(1)}
        </p>
      )}

      <p className="venueRating">
        {renderStars(venue.rating)}{" "}
        <span className="ratingNumber">({Number(venue.rating || 0).toFixed(1)})</span>
      </p>

      {Array.isArray(venue?.eventTags) && venue.eventTags.length > 0 && (
        <div className="eventTagRow">
          {venue.eventTags.map((tag) => (
            <span key={tag} className="eventTag">
              {tag.replace("-", " ")}
            </span>
          ))}
        </div>
      )}

      <hr />

      <div className="venueTags">
        <ul>
          <li>{venue.hasHappyHour ? "Happy Hour" : "No happy hour"}</li>
          <li>{venue.hasDailySpecials ? "Daily Specials" : "No daily specials"}</li>
          <li>{venue.hasEvents ? "Hosts Events" : "No events"}</li>
          <li className="venueCost">{venue.priceLevel}</li>
        </ul>
      </div>
    </div>
  );
}
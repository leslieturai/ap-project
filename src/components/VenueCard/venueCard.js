import { Link } from "react-router-dom";
import "./venueCard.css";

export default function VenueCard({ venue }) {
  if (!venue) return null;

  return (
    <div className="venueCard">

      <Link className="venueName" to={`/details/${venue.id}`}>
        {venue.name}
      </Link>

      <p className="venueAddress">{venue.address}</p>

      {/* Distance display when Near Me sorting is active */}
      {Number.isFinite(venue?.distanceKm) && (
        <p className="venueDistance">
          {venue.distanceKm.toFixed(1)} km away
        </p>
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
import { Link } from "react-router-dom";
import "./venueCard.css";

export default function VenueCard({ venue }) {
  if (!venue) return null;

  return (
    <div className="venueCard">
      <div className="venueName">
        <Link to={`/details/${venue.id}`}>{venue.name}</Link>
      </div>

      <p className="venueAddress">{venue.address}</p>

      <div className="venueTags">
        {venue.hasHappyHour && <span>Happy Hour</span>}
        {venue.hasDailySpecials && <span>Daily Specials</span>}
        {venue.hasEvents && <span>Events</span>}
      </div>
    </div>
  );
}
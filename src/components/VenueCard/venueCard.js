import { Link } from "react-router-dom";
import "./venueCard.css";

export default function VenueCard({ venue }) {
  if (!venue) return null;

  return (
    <div className="venueCard">
      
        <Link className="venueName" to={`/details/${venue.id}`}>{venue.name}</Link>
      

      <p className="venueAddress">{venue.address}</p>
      <hr></hr>

      <div className="venueTags">
        <ul>
          <li>{venue.hasHappyHour ? "Happy hour" : "No happy hour"}</li>
          <li>{venue.hasDailySpecials ? "Daily Specials" : "No daily specials"}</li>
          <li>{venue.hasEvents ? "Hosts Events" : "No events"}</li>
          <li className="venueCost">{venue.priceLevel}</li>
        </ul>
      </div>
    </div>
  );
}
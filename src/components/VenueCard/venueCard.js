import { Link } from "react-router-dom";
import "./venueCard.css";

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function formatCategory(category) {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function buildQuickBadges(venue) {
  const badges = [];

  if (venue?.hasHappyHour) badges.push("Happy Hour");
  if (venue?.hasDailySpecials) badges.push("Daily Specials");
  if (venue?.hasEvents) badges.push("Events");

  return badges;
}

function formatEventTag(tag) {
  if (!tag) return "";
  return tag.replace("-", " ");
}

export default function VenueCard({ venue }) {
  if (!venue) return null;

  const quickBadges = buildQuickBadges(venue);
  const eventTags = Array.isArray(venue?.eventTags) ? venue.eventTags.slice(0, 2) : [];

  return (
    <Link className="venueCard" to={`/details/${venue.id}`}>
      {venue?.imageUrl && (
        <img
          src={venue.imageUrl}
          alt={venue.name || "Restaurant"}
          className="venueCardImage"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      <div className="venueCardBody">
        <h3 className="venueName">{venue.name}</h3>

        <p className="venueAddress">{venue.address}</p>

        {Number.isFinite(venue?.distanceKm) && (
          <p className="venueDistance">{venue.distanceKm.toFixed(1)} km away</p>
        )}

        <div className="venueMetaRow">
          {venue?.foodCategory && (
            <span className="venueMetaItem">{formatCategory(venue.foodCategory)}</span>
          )}

          {venue?.priceLevel && (
            <span className="venueCost">{venue.priceLevel}</span>
          )}
        </div>

        <p className="venueRating">
          {renderStars(venue.rating)}{" "}
          <span className="ratingNumber">({Number(venue.rating || 0).toFixed(1)})</span>
        </p>

        {(quickBadges.length > 0 || eventTags.length > 0) && (
          <div className="badgeWrap">
            {quickBadges.map((badge) => (
              <span key={badge} className="quickBadge">
                {badge}
              </span>
            ))}

            {eventTags.map((tag) => (
              <span key={tag} className="eventTag">
                {formatEventTag(tag)}
              </span>
            ))}
          </div>
        )}

        <div className="venueCardFooter">
          <span className="viewDetailsText">View details →</span>
        </div>
      </div>
    </Link>
  );
}
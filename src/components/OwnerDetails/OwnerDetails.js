import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header/Header";
import "./ownerDetails.css";

import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const defaultHours = {
  monday: { open: "", close: "", closed: false },
  tuesday: { open: "", close: "", closed: false },
  wednesday: { open: "", close: "", closed: false },
  thursday: { open: "", close: "", closed: false },
  friday: { open: "", close: "", closed: false },
  saturday: { open: "", close: "", closed: false },
  sunday: { open: "", close: "", closed: false },
};

export default function OwnerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hours, setHours] = useState(defaultHours);
  const [priceLevel, setPriceLevel] = useState("$");
  const [about, setAbout] = useState("");
  const [offers, setOffers] = useState("");
  const [foodCategory, setFoodCategory] = useState("");
  const [happyHourDetails, setHappyHourDetails] = useState("");
  const [dailySpecialsDetails, setDailySpecialsDetails] = useState("");
  const [eventTagsInput, setEventTagsInput] = useState("");

  const [hasHappyHour, setHasHappyHour] = useState(false);
  const [hasDailySpecials, setHasDailySpecials] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/sign-up-in");
        return;
      }

      setUser(u);

      async function loadVenue() {
        setErr("");
        setMsg("");
        setLoading(true);

        try {
          if (!id) {
            setErr("No restaurant id.");
            setVenue(null);
            return;
          }

          const ref = doc(db, "restaurants", id);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            setErr("Restaurant not found.");
            setVenue(null);
            return;
          }

          const data = { id: snap.id, ...snap.data() };

          if (data.ownerUid !== u.uid) {
            setErr("You don't have permission to edit this restaurant.");
            setVenue(null);
            return;
          }

          setVenue(data);

          setName(data.name || "");
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setWebsite(data.website || "");
          setImageUrl(data.imageUrl || "");
          setHours(data.hours || defaultHours);
          setPriceLevel(data.priceLevel || "$");
          setAbout(data.about || "");
          setOffers(data.offers || "");
          setFoodCategory(data.foodCategory || "");
          setHappyHourDetails(data.happyHourDetails || "");
          setDailySpecialsDetails(data.dailySpecialsDetails || "");
          setEventTagsInput(
            Array.isArray(data.eventTags) ? data.eventTags.join(", ") : ""
          );

          setHasHappyHour(!!data.hasHappyHour);
          setHasDailySpecials(!!data.hasDailySpecials);
          setHasEvents(!!data.hasEvents);
        } catch (e) {
          setErr(e?.message || "Failed to load restaurant.");
          setVenue(null);
        } finally {
          setLoading(false);
        }
      }

      loadVenue();
    });

    return () => unsub();
  }, [navigate, id]);

  function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  function handleHoursChange(day, field, value) {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!venue || !user) return;

    setErr("");
    setMsg("");
    setSaving(true);

    const eventTags = eventTagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    try {
      await updateDoc(doc(db, "restaurants", venue.id), {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        website: normalizeUrl(website),
        imageUrl: normalizeUrl(imageUrl),
        hours,
        priceLevel,
        about,
        offers,
        foodCategory: foodCategory.trim().toLowerCase(),
        happyHourDetails: happyHourDetails.trim(),
        dailySpecialsDetails: dailySpecialsDetails.trim(),
        eventTags,
        hasHappyHour,
        hasDailySpecials,
        hasEvents,
      });

      setMsg("Saved!");
    } catch (e) {
      setErr(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!venue || !user) return;

    const ok = window.confirm("Delete this restaurant? This cannot be undone.");
    if (!ok) return;

    setErr("");
    setMsg("");
    setSaving(true);

    try {
      await deleteDoc(doc(db, "restaurants", venue.id));
      navigate("/owner-page");
    } catch (e) {
      setErr(e?.message || "Failed to delete restaurant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />

      <section className="ownerDetailsWrap">
        <h1>Manage Restaurant</h1>

        {loading ? (
          <p>Loading...</p>
        ) : err ? (
          <>
            <p className="ownerDetailsError">{err}</p>
            <button type="button" onClick={() => navigate("/owner-page")}>
              Back
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="ownerDetailsForm">
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Address
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Website
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Image URL
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={saving}
              />
            </label>

            {imageUrl.trim() && (
              <img
                src={normalizeUrl(imageUrl)}
                alt="Restaurant preview"
                className="ownerImagePreview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            <div className="hoursBlock">
              <h3>Weekly Hours</h3>

              {Object.entries(hours).map(([day, value]) => (
                <div key={day} className="hoursRow">
                  <div className="hoursDay">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>

                  <label className="hoursClosed">
                    <input
                      type="checkbox"
                      checked={value.closed}
                      onChange={(e) =>
                        handleHoursChange(day, "closed", e.target.checked)
                      }
                      disabled={saving}
                    />
                    Closed
                  </label>

                  <input
                    type="time"
                    value={value.open}
                    onChange={(e) =>
                      handleHoursChange(day, "open", e.target.value)
                    }
                    disabled={saving || value.closed}
                  />

                  <input
                    type="time"
                    value={value.close}
                    onChange={(e) =>
                      handleHoursChange(day, "close", e.target.value)
                    }
                    disabled={saving || value.closed}
                  />
                </div>
              ))}
            </div>

            <label>
              Price Level
              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(e.target.value)}
                disabled={saving}
              >
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>
            </label>

            <label>
              Food Category
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value)}
                disabled={saving}
              >
                <option value="">Select Food Category</option>
                <option value="pub">Pub</option>
                <option value="pizza">Pizza</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="burger">Burger</option>
                <option value="cafe">Cafe</option>
              </select>
            </label>

            <label>
              About
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Offers
              <textarea
                value={offers}
                onChange={(e) => setOffers(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Happy Hour Details
              <textarea
                value={happyHourDetails}
                onChange={(e) => setHappyHourDetails(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Daily Specials Details
              <textarea
                value={dailySpecialsDetails}
                onChange={(e) => setDailySpecialsDetails(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Event Tags
              <input
                value={eventTagsInput}
                onChange={(e) => setEventTagsInput(e.target.value)}
                placeholder="trivia, live-music, sports"
                disabled={saving}
              />
            </label>

            <div className="ownerChecks">
              <label>
                <input
                  type="checkbox"
                  checked={hasHappyHour}
                  onChange={(e) => setHasHappyHour(e.target.checked)}
                  disabled={saving}
                />
                Happy Hour
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={hasDailySpecials}
                  onChange={(e) => setHasDailySpecials(e.target.checked)}
                  disabled={saving}
                />
                Daily Specials
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={hasEvents}
                  onChange={(e) => setHasEvents(e.target.checked)}
                  disabled={saving}
                />
                Events
              </label>
            </div>

            {msg && <p className="ownerDetailsMsg">{msg}</p>}
            {err && <p className="ownerDetailsError">{err}</p>}

            <div className="ownerDetailsActions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete Restaurant
              </button>

              <button
                type="button"
                onClick={() => navigate("/owner-page")}
                disabled={saving}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";

import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";

import "./ownerPage.css";

const defaultHours = {
  monday: { open: "", close: "", closed: false },
  tuesday: { open: "", close: "", closed: false },
  wednesday: { open: "", close: "", closed: false },
  thursday: { open: "", close: "", closed: false },
  friday: { open: "", close: "", closed: false },
  saturday: { open: "", close: "", closed: false },
  sunday: { open: "", close: "", closed: false },
};

export default function OwnerPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hours, setHours] = useState(defaultHours);
  const [priceLevel, setPriceLevel] = useState("$");
  const [foodCategory, setFoodCategory] = useState("");
  const [happyHourDetails, setHappyHourDetails] = useState("");
  const [dailySpecialsDetails, setDailySpecialsDetails] = useState("");
  const [eventTagsInput, setEventTagsInput] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/sign-up-in");
      } else {
        setUser(u);
        loadRestaurants(u.uid);
      }
    });

    return () => unsub();
  }, [navigate]);

  async function loadRestaurants(uid) {
    try {
      const q = query(collection(db, "restaurants"), where("ownerUid", "==", uid));
      const snap = await getDocs(q);
      setRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErr(e?.message || "Failed to load restaurants.");
    }
  }

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

  function formatHoursPreview(hoursObj) {
    const firstOpenDay = Object.entries(hoursObj).find(
      ([, value]) => !value.closed && value.open && value.close
    );
    if (!firstOpenDay) return "Hours not added";
    return "Custom weekly schedule added";
  }

  async function handleAddRestaurant(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !address.trim()) {
      setErr("Please enter a name and address.");
      return;
    }

    if (!user) {
      setErr("You must be logged in.");
      return;
    }

    const eventTags = eventTagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    setSaving(true);

    try {
      await addDoc(collection(db, "restaurants"), {
        name: name.trim(),
        address: address.trim(),
        cityId: "calgary",
        ownerUid: user.uid,
        rating: 0,
        ratingCount: 0,
        priceLevel,
        offers: "",
        about: "",
        phone: phone.trim(),
        website: normalizeUrl(website),
        imageUrl: normalizeUrl(imageUrl),
        hours,
        foodCategory: foodCategory.trim().toLowerCase(),
        happyHourDetails: happyHourDetails.trim(),
        dailySpecialsDetails: dailySpecialsDetails.trim(),
        eventTags,
        events: [],
        hasHappyHour: !!happyHourDetails.trim(),
        hasDailySpecials: !!dailySpecialsDetails.trim(),
        hasEvents: eventTags.length > 0,
        createdAt: Date.now(),
      });

      setName("");
      setAddress("");
      setPhone("");
      setWebsite("");
      setImageUrl("");
      setHours(defaultHours);
      setPriceLevel("$");
      setFoodCategory("");
      setHappyHourDetails("");
      setDailySpecialsDetails("");
      setEventTagsInput("");
      setShowCreateForm(false);

      await loadRestaurants(user.uid);
    } catch (e) {
      setErr(e?.message || "Failed to add restaurant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />

      <section className="ownerWrap">
        <div className="ownerPageTop">
          <div>
            <h1>Business Dashboard</h1>
            <p className="ownerSubtext">Manage your restaurants or add a new one.</p>
          </div>

          <button
            type="button"
            className="ownerCreateToggleBtn"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? "Close Form" : "+ Add Restaurant"}
          </button>
        </div>

        {showCreateForm && (
          <>
            <h2>Create Restaurant</h2>
            {err && <p className="ownerError">{err}</p>}

            <form onSubmit={handleAddRestaurant} className="ownerForm">
              <input
                type="text"
                placeholder="Restaurant Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />

              <input
                type="text"
                placeholder="Address (Calgary)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
              />

              <input
                type="text"
                placeholder="Phone (403-xxx-xxxx)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
              />

              <input
                type="text"
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={saving}
              />

              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={saving}
              />

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

              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(e.target.value)}
                disabled={saving}
              >
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>

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

              <textarea
                placeholder="Happy Hour Details"
                value={happyHourDetails}
                onChange={(e) => setHappyHourDetails(e.target.value)}
                disabled={saving}
              />

              <textarea
                placeholder="Daily Specials Details"
                value={dailySpecialsDetails}
                onChange={(e) => setDailySpecialsDetails(e.target.value)}
                disabled={saving}
              />

              <input
                type="text"
                placeholder="Event Tags (example: trivia, live-music, sports)"
                value={eventTagsInput}
                onChange={(e) => setEventTagsInput(e.target.value)}
                disabled={saving}
              />

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Restaurant"}
              </button>
            </form>

            <hr className="ownerHr" />
          </>
        )}

        <h2>Your Restaurants</h2>

        {restaurants.length === 0 ? (
          <p>No restaurants yet.</p>
        ) : (
          <div className="ownerList">
            {restaurants.map((r) => (
              <div key={r.id} className="ownerCard">
                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="ownerCardImage"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div>
                  <strong>{r.name}</strong>
                  <p className="ownerAddr">{r.address}</p>
                  {r.phone && <p>{r.phone}</p>}
                  {r.hours && <p>{formatHoursPreview(r.hours)}</p>}
                  {r.foodCategory && <p>{r.foodCategory}</p>}
                  {r.priceLevel && <p>Price: {r.priceLevel}</p>}
                </div>

                <div className="ownerActions">
                  <button onClick={() => navigate(`/details/${r.id}`)}>
                    View Public
                  </button>
                  <button onClick={() => navigate(`/owner-details/${r.id}`)}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { auth, db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);
      setErr("");

      try {
        const user = auth.currentUser;

        if (!user) {
          setErr("You must be logged in to view favorites.");
          setFavorites([]);
          return;
        }

        const favRef = collection(db, "users", user.uid, "favorites");
        const snapshot = await getDocs(favRef);

        const favList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setFavorites(favList);
      } catch (e) {
        console.error(e);
        setErr("Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  async function removeFavorite(restaurantId) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", restaurantId));
      setFavorites((prev) => prev.filter((fav) => fav.id !== restaurantId));
    } catch (e) {
      console.error("Failed to remove favorite:", e);
      alert("Could not remove favorite.");
    }
  }

  return (
    <>
      <Header />

      <section className="favoritesPage">
        <div className="favoritesHeading">
          <h1>My Favorites</h1>
          <p>Quickly jump back to restaurants you’ve saved.</p>
        </div>

        {loading ? (
          <div className="favoritesStateCard">
            <p>Loading favorites...</p>
          </div>
        ) : err ? (
          <div className="favoritesStateCard">
            <p className="favoritesError">{err}</p>
            <button className="favoritesBackBtn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="favoritesStateCard">
            <h2>No favorites yet</h2>
            <p>Save restaurants from their details page to see them here.</p>
            <button className="favoritesBackBtn" onClick={() => navigate("/")}>
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="favoritesGrid">
            {favorites.map((fav) => (
              <div key={fav.id} className="favoriteCard">
                <div className="favoriteCardBody">
                  <h2>{fav.name || "Restaurant"}</h2>
                  <p className="favoriteAddress">
                    {fav.address || "No address available."}
                  </p>
                </div>

                <div className="favoriteActions">
                  <Link
                    className="favoriteLinkBtn"
                    to={`/details/${fav.restaurantId || fav.id}`}
                  >
                    View Details
                  </Link>

                  <button
                    className="favoriteRemoveBtn"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    Remove
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
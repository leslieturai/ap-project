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
        <h1>My Favorites</h1>

        {loading ? (
          <p>Loading favorites...</p>
        ) : err ? (
          <div>
            <p>{err}</p>
            <button onClick={() => navigate("/")}>Back to Home</button>
          </div>
        ) : favorites.length === 0 ? (
          <p>No favorites saved yet.</p>
        ) : (
          <div className="favoritesList">
            {favorites.map((fav) => (
              <div key={fav.id} className="favoriteCard">
                <h2>{fav.name || "Restaurant"}</h2>
                <p>{fav.address || "No address available."}</p>

                <div className="favoriteActions">
                  <Link to={`/details/${fav.restaurantId || fav.id}`}>
                    View Details
                  </Link>

                  <button onClick={() => removeFavorite(fav.id)}>
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
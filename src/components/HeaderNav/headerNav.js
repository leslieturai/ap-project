import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "./headerNav.css";

export default function HeaderNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome =
    location.pathname === "/" ||
    location.pathname.startsWith("/details");

  const isDeals = location.pathname.startsWith("/deals");

  function handleHomeClick(e) {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      navigate("/sign-up-in");
    } else {
      navigate("/");
    }
  }

  return (
    <section id="header-nav">
      <p className={isHome ? "navItem selected" : "navItem"}>
        <a href="/" onClick={handleHomeClick}>Home</a>
      </p>

      <p className={isDeals ? "navItem selected" : "navItem"}>
        <Link to="/deals">Events & Deals</Link>
      </p>
    </section>
  );
}
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { APIProvider } from "@vis.gl/react-google-maps";
import Home from './components/Home/home.js';
import SignUpIn from './components/SignUpIn/signUpIn.js';
import Details from './components/Details/details.js';
import CitySelect from './components/CitySelect/citySelect.js';
import OwnerPage from './components/OwnerPage/ownerPage.js';
import OwnerDetails from './components/OwnerDetails/OwnerDetails.js';
import RequireRole from "./components/Auth/RequireRole";
import RequireAuth from "./components/Auth/RequireAuth";
import Listings from "./components/Listings/Listings";
import Deals from "./components/Deals/deals.js";
import Favorites from './components/Favorites/favorites';

function App() {
  return (
    <APIProvider
      apiKey={"AIzaSyDy-6rkV4XH2UXvyubcwT3PLH9H-Hef0vI"}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/sign-up-in" element={<SignUpIn />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />

          <Route
            path="/details/:id"
            element={
              <RequireAuth>
                <Details />
              </RequireAuth>
            }
          />

          <Route
            path="/listings"
            element={
              <RequireAuth>
                <Listings />
              </RequireAuth>
            }
          />

          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />

          <Route
            path="/deals"
            element={
              <RequireAuth>
                <Deals />
              </RequireAuth>
            }
          />

          <Route
            path="/city-select"
            element={
              <RequireRole role="customer">
                <CitySelect />
              </RequireRole>
            }
          />

          <Route
            path="/owner-page"
            element={
              <RequireRole role="owner">
                <OwnerPage />
              </RequireRole>
            }
          />

          <Route
            path="/owner-details/:id"
            element={
              <RequireRole role="owner">
                <OwnerDetails />
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
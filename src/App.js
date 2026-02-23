import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { APIProvider } from "@vis.gl/react-google-maps";
import Home from './components/Home/home.js';
import SignUpIn from './components/SignUpIn/signUpIn.js';
import Details from './components/Details/details.js';
import CitySelect from './components/CitySelect/citySelect.js';
import OwnerPage from './components/OwnerPage/ownerPage.js';
import OwnerDetails from './components/OwnerDetails/OwnerDetails.js';



function App() {
  return (
    <APIProvider
      apiKey={process.env.REACT_APP_MAPS_KEY}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up-in" element={<SignUpIn />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/city-select" element={<CitySelect />} />
          <Route path="/owner-page" element={<OwnerPage />} />
          <Route path="/owner-details/:id" element={<OwnerDetails />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;

import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const calgaryRestaurants = [
  {
    id: "ship-anchor",
    name: "Ship & Anchor Pub",
    address: "534 17 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: true,
  },
  {
    id: "national-10th",
    name: "National on 10th",
    address: "341 10 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: false,
    hasEvents: false,
  },
  {
    id: "craft-beer-market",
    name: "Craft Beer Market",
    address: "345 10 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: false,
  },
  {
    id: "trolley-5",
    name: "Trolley 5",
    address: "728 17 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: true,
  },
  {
    id: "pinbar",
    name: "PinBar",
    address: "501 17 Ave SW",
    cityId: "calgary",
    hasHappyHour: false,
    hasDailySpecials: true,
    hasEvents: true,
  },
  {
    id: "cowboys",
    name: "Cowboys Dance Hall",
    address: "421 12 Ave SE",
    cityId: "calgary",
    hasHappyHour: false,
    hasDailySpecials: false,
    hasEvents: true,
  },
  {
    id: "greta-bar",
    name: "Greta Bar",
    address: "213 10 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: false,
    hasEvents: true,
  },
  {
    id: "hayden-block",
    name: "Hayden Block",
    address: "1136 Kensington Rd NW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: false,
  },
  {
    id: "blanco-cantina",
    name: "Blanco Cantina",
    address: "723 17 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: false,
  },
  {
    id: "bottlescrew-bills",
    name: "Bottlescrew Bill’s",
    address: "140 10 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: true,
  },
  {
    id: "rose-crown",
    name: "Rose & Crown Pub",
    address: "1503 4 St SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: false,
    hasEvents: true,
  },
  {
    id: "the-ship-yard",
    name: "The Ship & Anchor",
    address: "534 17 Ave SW",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: true,
    hasEvents: false,
  },
  {
    id: "mug-shotz",
    name: "Mug Shotz",
    address: "112 6 Ave SW",
    cityId: "calgary",
    hasHappyHour: false,
    hasDailySpecials: true,
    hasEvents: false,
  },
  {
    id: "juliettes-castle",
    name: "Juliettes Castle",
    address: "840 16 Ave SW",
    cityId: "calgary",
    hasHappyHour: false,
    hasDailySpecials: false,
    hasEvents: true,
  },
  {
    id: "cold-garden",
    name: "Cold Garden Beverage Co.",
    address: "1100 11 St SE",
    cityId: "calgary",
    hasHappyHour: true,
    hasDailySpecials: false,
    hasEvents: true,
  },
];

export async function seedCalgaryRestaurants() {
  const colRef = collection(db, "restaurants");

  for (const r of calgaryRestaurants) {
    await setDoc(doc(colRef, r.id), r, { merge: true });
  }

  return calgaryRestaurants.length;
}
# 🍽️ EvoEats

## 📌 Project Overview

EvoEats is a React + Firebase web application that helps users discover restaurants, daily specials, happy hours, and events happening in their city.

The app allows:

* Users to browse restaurants and find deals happening **today**
* Filter by **happy hour, specials, and events (live music, trivia)**
* Save favorite restaurants
* Leave ratings and reviews
* Restaurant owners to manage their listings and promotions

---

## 🎯 Project Goal

The goal of EvoEats is to make it easy for users to answer one simple question:

👉 **“Where should I go tonight?”**

At the same time, it helps restaurants increase traffic by promoting time-sensitive deals and events.

---

## 🧠 Key Features

### 👤 User Features

* Sign up / Login (Firebase Authentication)
* Browse restaurants by city
* View restaurant details
* Filter by:

  * Happy Hour
  * Daily Specials
  * Events (Live Music, Trivia)
* Save favorites ❤️
* Leave ratings ⭐
* Write reviews 💬

---

### 🧑‍💼 Restaurant Owner Features

* Create restaurant listings
* Edit restaurant details
* Add:

  * Happy hours
  * Daily specials
  * Events

---

### ⭐ Sprint 3 Features (Final Polish)

* Reviews and ratings system
* Restaurant contact info (phone + hours)
* User profile updates
* Change city feature
* Dark mode 🌙
* Upload restaurant image/logo
* Loading and empty states

---

## 🧱 Tech Stack

### Frontend

* React
* React Router
* CSS Modules

### Backend

* Firebase Authentication
* Firestore Database

### APIs

* Google Maps API (@vis.gl/react-google-maps)

---

## 🗂️ Database Structure (Firestore)

### Users

users/{uid}

```
{
  role: "customer" | "owner",
  cityId: "calgary",
  createdAt: timestamp
}
```

### Restaurants

restaurants/{restaurantId}

```
{
  name,
  address,
  cityId,
  phone,
  hours,
  ownerUid,
  rating,
  ratingCount,
  hasLiveMusic,
  hasTriviaNight,
  createdAt
}
```

### Reviews

restaurants/{restaurantId}/reviews/{userId}

```
{
  review,
  rating,
  userEmail,
  createdAt
}
```

### Ratings

restaurants/{restaurantId}/ratings/{userId}

```
{
  rating,
  createdAt
}
```

### Favorites

users/{userId}/favorites/{restaurantId}

```
{
  restaurantId,
  name,
  address,
  createdAt
}
```

---

## 🔐 Authentication & Roles

* Users sign up as:

  * Customer
  * Restaurant Owner
* Role-based routing:

  * Customers → Browse restaurants
  * Owners → Manage listings

---

## 🧭 Routing Structure

* `/` → Home
* `/sign-up-in` → Login / Signup
* `/city-select` → Choose city
* `/details/:id` → Restaurant details
* `/favorites` → Saved restaurants
* `/owner-page` → Owner dashboard
* `/owner-details/:id` → Edit restaurant

---

## 🚀 How to Run the Project

### 1. Clone the repository

```
git clone <your-repo-url>
cd ap-project
```

### 2. Install dependencies

```
npm install
```

### 3. Start the app

```
npm start
```

---

## 🔥 Future Improvements

* Notifications for new deals
* “Live Tonight” feature
* Advanced filtering
* Mobile optimization

---

## 🧪 Project Status

✅ Sprint 1: Complete
✅ Sprint 2: Complete
✅ Sprint 3: Final polish complete

---

## 💡 What Makes EvoEats Unique?

* Focuses on **real-time deals**, not static menus
* Combines features from:

  * Google Maps
  * Instagram
  * Facebook Events
* Helps both **users AND businesses**



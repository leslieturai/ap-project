import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * users/{uid} = {
 *   role: "customer" | "owner",
 *   cityId: "calgary" | "",
 *   createdAt: number
 * }
 */

export async function getUserProfile(db, uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function ensureUserProfile(db, uid, data = {}) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const newProfile = {
      role: data.role || "customer",
      cityId: data.cityId || "",
      createdAt: Date.now(),
    };

    await setDoc(ref, newProfile);
    return newProfile;
  }

  return { id: snap.id, ...snap.data() };
}
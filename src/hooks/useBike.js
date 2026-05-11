import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export const useBike = () => {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchBike = async () => {
      try {
        const bikeRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "bike_info",
          "default",
        );
        const bikeSnap = await getDoc(bikeRef);

        if (bikeSnap.exists()) {
          setBike(bikeSnap.data());
        } else {
          setBike(null);
        }
      } catch (error) {
        console.error("Error fetching bike:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, []);

  const registerBike = async (bikeData) => {
    if (!auth.currentUser) return;

    try {
      const bikeRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "bike_info",
        "default",
      );
      await setDoc(bikeRef, {
        ...bikeData,
        createdAt: new Date(),
      });
      setBike(bikeData);
      return true;
    } catch (error) {
      console.error("Error registering bike:", error);
      return false;
    }
  };

  return { bike, loading, registerBike };
};

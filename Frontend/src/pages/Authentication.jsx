import { auth } from "../fireBase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Signup
export const signup = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Login
export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = async () => {
  return await signOut(auth);
};

export const sendProtectedRequest = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();

    const res = await fetch("http://localhost:5000/api/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log(data);
  }
};
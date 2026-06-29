import { Stack } from "expo-router";
import React from "react";
import "../global.css";
import { GlobalProvider } from "./context/GlobalContext";

export default function Layout() {
  return (
    <GlobalProvider>
       <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
}
import React from "react";

import "../global.css";

import { GlobalProvider } from "./context/GlobalContext";
import { Stack } from "expo-router";



export default function Layout() {

  return (

    <GlobalProvider>

       <Stack screenOptions={{ headerShown: false }} />

    </GlobalProvider>

  );
}
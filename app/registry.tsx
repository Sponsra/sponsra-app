"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { PrimeReactProvider } from "primereact/api";

export default function PrimeReactRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrimeReactProvider value={{ ripple: true }}>{children}</PrimeReactProvider>
  );
}

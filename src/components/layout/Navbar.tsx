"use client";

import { useUIStore } from "@/store/useUIStore";

export function Navbar() {
  const { openSearchModal } = useUIStore();

  return (
    <nav>
      <button onClick={openSearchModal}>Search</button>
    </nav>
  );
}

"use client";

import { Children, useState } from "react";
import { btn } from "./ui/styles";

// Menampilkan `pageSize` item pertama dan tombol "Muat lebih banyak".
export function LoadMore({ children, pageSize = 12 }: { children: React.ReactNode; pageSize?: number }) {
  const items = Children.toArray(children);
  const [count, setCount] = useState(pageSize);
  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.slice(0, count)}</ul>
      {count < items.length && (
        <div className="mt-10 flex justify-center">
          <button type="button" className={btn.secondary} onClick={() => setCount((c) => c + pageSize)}>
            Muat lebih banyak
          </button>
        </div>
      )}
    </>
  );
}

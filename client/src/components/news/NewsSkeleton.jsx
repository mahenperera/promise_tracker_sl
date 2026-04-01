import React from "react";

export default function NewsSkeleton({ count = 9 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
        >
          <div className="aspect-video bg-slate-200" />
          <div className="p-4">
            <div className="mb-3 flex gap-2">
              <div className="h-6 w-28 rounded-full bg-slate-200" />
              <div className="h-6 w-36 rounded-full bg-slate-200" />
            </div>
            <div className="h-5 w-full rounded bg-slate-200" />
            <div className="mt-2 h-5 w-5/6 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-4/5 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-40 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

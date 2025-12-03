"use client";

import dynamic from "next/dynamic";

const SuccessStories = dynamic(
  () => import("./SuccessStories").then((mod) => mod.SuccessStories),
  { ssr: false, loading: () => <p className="text-sm text-slate-500">Chargement des retours…</p> }
);

export const SuccessStoriesLoader = () => <SuccessStories />;

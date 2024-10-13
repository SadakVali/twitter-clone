"use client";

import { useFeedbarStoreSelector } from "@/store/feedbar-store";

const TABS = ["Recent", "Followers"] as const;

export default function TweetsFeedBar() {
  const toggleFeedType = useFeedbarStoreSelector.use.toggle();
  const feedType = useFeedbarStoreSelector.use.feedType();

  return (
    <div className="flex">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => toggleFeedType()}
          className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${tab === feedType ? "border-b-4 border-b-blue-500 font-bold" : ""}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

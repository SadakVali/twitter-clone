"use client";

import { useFeedbarStoreSelector } from "@/store/feedbar-store";
import { RecentTweets } from "./NewTweetForm";
import FollowinTweets from "./FollowinTweets";

export default function TweetsFeed() {
  const feedType = useFeedbarStoreSelector.use.feedType();
  if (feedType === "Recent") return <RecentTweets />;
  return <FollowinTweets />;
}

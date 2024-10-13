import { HydrateClient } from "@/trpc/server";
import NewTweetForm, { RecentTweets } from "./_components/NewTweetForm";
import TweetsFeedBar from "./_components/TweetsFeedBar";
import TweetsFeed from "./_components/TweetsFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <HydrateClient>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {!!session && <TweetsFeedBar />}
      </header>
      <NewTweetForm />
      <TweetsFeed />
    </HydrateClient>
  );
}

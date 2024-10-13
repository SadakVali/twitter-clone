"use client";

import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import type { FormEvent } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { api } from "@/trpc/react";
import InfiniteTweetList from "./InfiniteTweetList";

const updateTextAreasize = (textArea?: HTMLTextAreaElement) => {
  if (textArea) {
    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }
};

function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreasize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    if (textAreaRef) updateTextAreasize(textAreaRef?.current);
  }, [inputValue]);

  const trpcUtils = api.useUtils();

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      console.log(newTweet);
      setInputValue("");

      if (session.status !== "authenticated") return;

      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData?.pages?.[0] == null) return oldData;
        const newCacheTweet = {
          ...newTweet,
          likesCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name ?? null,
            image: session.data.user.image ?? null,
          },
        };
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              tweets: [newCacheTweet, ...oldData.pages[0].tweets],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createTweet.mutate({ content: inputValue });
  };

  if (session.status === "unauthenticated") return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src="" />
        <textarea
          ref={inputRef}
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          // style={{ height: 0 }}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's Happening?"
        />
      </div>
      <Button className="self-end">Tweet</Button>
    </form>
  );
}

export default function NewTweetForm() {
  const session = useSession();
  if (session.status === "unauthenticated") return null;
  return <Form />;
}

export function RecentTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

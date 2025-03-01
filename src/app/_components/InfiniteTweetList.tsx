"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import IconHoverEffect from "./IconHoverEffect";
import { api } from "@/trpc/react";
import LoadingSpinner from "./LoadingSpinner";

type TweetProps = {
  id: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  likedByMe: boolean;
  user: { id: string; name: string | null; image: string | null };
};

type InfiniteTweetListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore?: boolean;
  fetchNewTweets: () => Promise<unknown>;
  tweets?: TweetProps[];
};

export default function InfiniteTweetList({
  tweets,
  isLoading,
  isError,
  hasMore = false,
  fetchNewTweets,
}: InfiniteTweetListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;
  if (tweets == null || tweets.length === 0)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">
        You have no Tweets
      </h2>
    );

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} {...tweet} />
        ))}
      </InfiniteScroll>
    </ul>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

function TweetCard({
  id,
  user,
  content,
  createdAt,
  likesCount,
  likedByMe,
}: TweetProps) {
  const trpcUtils = api.useUtils();

  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      // await trpcUtils.tweet.infiniteFeed.invalidate();
      const updateData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;
        const conutModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            tweets: page.tweets.map((tweet) => {
              if (tweet.id === id)
                return {
                  ...tweet,
                  likesCount: likesCount + conutModifier,
                  likedByMe: addedLike,
                };
              return tweet;
            }),
          })),
        };
      };
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
    },
  });

  const handleToggleLike = async () => {
    toggleLike.mutate({ id });
  };

  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profile/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profile/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isPending}
          likedByMe={likedByMe}
          likeCount={likesCount}
        />
      </div>
    </li>
  );
}

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
  onClick: () => void;
  isLoading: boolean;
};

function HeartButton({
  likedByMe,
  likeCount,
  onClick,
  isLoading,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status === "unauthenticated")
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"}`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-color duration-200 ${likedByMe ? "fill-red-500" : "fill-gray-500"} group-hover:fill-red-500 group-focus-visible:fill-red-500`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

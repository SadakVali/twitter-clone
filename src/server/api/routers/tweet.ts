import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import type { createTRPCContext } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";

export const tweetRouter = createTRPCRouter({
  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      }),
    )
    .query(
      async ({ input: { onlyFollowing = false, limit = 10, cursor }, ctx }) => {
        const currUserId = ctx.session?.user.id;
        return await getInfiniteTweets({
          limit,
          cursor,
          ctx,
          whereClause:
            currUserId == null || !onlyFollowing
              ? undefined
              : {
                  user: {
                    followers: { some: { id: currUserId } },
                  },
                },
        });
      },
    ),

  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      return await ctx.db.tweet.create({
        data: { userId: ctx.session.user.id, content },
      });
    }),

  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { tweetId: id, userId: ctx.session.user.id };
      const existingLike = await ctx.db.like.findUnique({
        where: { userId_tweetId: data },
      });
      if (existingLike == null) {
        await ctx.db.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.db.like.delete({ where: { userId_tweetId: data } });
        return { addedLike: false };
      }
    }),
});

async function getInfiniteTweets({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause: Prisma.TweetWhereInput | undefined;
  ctx: Awaited<ReturnType<typeof createTRPCContext>>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
}) {
  const currUserId = ctx.session?.user.id;

  const tweets = await ctx.db.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? cursor : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } }, // How many likes this tweet has?
      likes: !!currUserId ? { where: { userId: currUserId } } : false, // Is this tweet liked by the user?
      user: { select: { name: true, id: true, image: true } }, // Here id can be used to redirect the user to profile of the person who liked the tweet.
    },
  });

  let nextCursor: typeof cursor | undefined = undefined;
  if (tweets.length > limit) {
    const nextTweet = tweets.pop();
    if (nextTweet)
      nextCursor = { id: nextTweet.id, createdAt: nextTweet.createdAt };
  }

  return {
    tweets: tweets.map((tweet) => ({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.createdAt,
      likesCount: tweet._count.likes,
      user: tweet.user,
      likedByMe: tweet.likes?.length > 0,
    })),
    nextCursor,
  };
}

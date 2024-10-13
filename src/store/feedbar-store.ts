import { create } from "zustand";
import { createSelectors } from "./create-selectors";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

type FeedbarStateType = {
  feedType: string;
  toggle: () => void;
};

const useFeedbarStore = create<FeedbarStateType>()(
  immer(
    persist(
      (set) => ({
        feedType: "Recent",
        toggle: () =>
          set((state) => {
            state.feedType =
              state.feedType === "Recent" ? "Followers" : "Recent";
          }),
      }),
      { name: "feedbarStore" },
    ),
  ),
);

export const useFeedbarStoreSelector = createSelectors(useFeedbarStore);

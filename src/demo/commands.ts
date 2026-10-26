/** UI action descriptions only. This prototype does not execute business actions. */
import type {
  DemoState,
  ListingDraft,
  Media,
  Receipt,
  Viewer,
} from "../domain/types";
export type Command =
  | { type: "viewer"; value: Viewer }
  | {
      type: "connection";
      value: DemoState["connection"];
    }
  | { type: "mode"; value: DemoState["resultMode"] }
  | {
      type: "bid";
      receipt: Receipt;
    }
  | { type: "settle"; requestId: string }
  | {
      type: "comment";
      auctionId: number;
      text: string;
      id: string;
    }
  | {
      type: "listing";
      id: number;
      sourceId?: number;
      mode: "create" | "edit" | "relist";
      draft: ListingDraft;
    }
  | {
      type: "review";
      auctionId: number;
      approve: boolean;
      reason: string;
      checked: boolean;
    }
  | { type: "activate"; auctionId: number; startAt: string; endAt: string }
  | {
      type: "analysis";
      auctionId: number;
      finish?: boolean;
    }
  | { type: "confirm"; tradeId: number }
  | {
      type: "message";
      tradeId: number;
      text: string;
      id: string;
    }
  | { type: "read"; tradeId: number }
  | {
      type: "rating";
      tradeId: number;
      stars: number;
      text: string;
    }
  | {
      type: "complaint";
      id: number;
      tradeId: number;
      reason: string;
      text: string;
      media: Media[];
    }
  | { type: "claim"; id: number }
  | {
      type: "resolve";
      id: number;
      reply: string;
    }
  | {
      type: "scenario";
      auctionId: number;
      value: "scheduled" | "winner" | "empty";
    };

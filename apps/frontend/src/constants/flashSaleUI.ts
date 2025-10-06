export type SaleStatus = "active" | "upcoming" | "ended" | "purchased" | "none";

export type FlashSaleUIBase = {
  badgeText: string;
  headingText: string;
  showTimer: boolean;
  timerHeading: string; // empty when no timer
  stockLabel: string;
  stockBarWidth: string; // percentage string, e.g., "23%"
  stockBarMuted: boolean;
  buttonDisabled: boolean;
  // When a static label applies for all users, use buttonLabel.
  // When label depends on auth, use the *_When* variants and leave buttonLabel null.
  buttonLabel: string | null;
  buttonLabelWhenLoggedIn?: string;
  buttonLabelWhenLoggedOut?: string;
  // If true, use saleStartTime for the timer; otherwise use saleEndTime.
  useStartTime?: boolean;
};

export const FLASH_SALE_UI_BY_STATUS: (
  flashSale: any
) => Record<SaleStatus, FlashSaleUIBase> = (flashSale) => {
  return {
    active: {
      badgeText: "FLASH SALE",
      headingText: "Limited Time Offer",
      showTimer: true,
      timerHeading: "Hurry! Sale ends in:",
      stockLabel: `Only ${flashSale?.remainingStock} left!`,
      stockBarWidth: `${
        (flashSale?.remainingStock / flashSale?.totalStock) * 100
      }%`,
      stockBarMuted: false,
      buttonDisabled: false,
      buttonLabel: null,
      buttonLabelWhenLoggedIn: "Buy Now",
      buttonLabelWhenLoggedOut: "Login to Purchase",
      useStartTime: false,
    },
    upcoming: {
      badgeText: "UPCOMING FLASH SALE",
      headingText: "Get Ready for Massive Savings",
      showTimer: true,
      timerHeading: "Sale starts in:",
      stockLabel: "Starts soon",
      stockBarWidth: "0%",
      stockBarMuted: true,
      buttonDisabled: true,
      buttonLabel: "Coming Soon",
      useStartTime: true,
    },
    ended: {
      badgeText: "FLASH SALE ENDED",
      headingText: "Great Deals Coming Soon",
      showTimer: false,
      timerHeading: "",
      stockLabel: "Sale ended",
      stockBarWidth: "0%",
      stockBarMuted: true,
      buttonDisabled: true,
      buttonLabel: "Sale Ended",
      useStartTime: false,
    },
    purchased: {
      badgeText: "PURCHASED",
      headingText: "Thanks for your purchase!",
      showTimer: false,
      timerHeading: "",
      stockLabel: "Already purchased",
      stockBarWidth: "100%",
      stockBarMuted: true,
      buttonDisabled: true,
      buttonLabel: "Purchased",
      useStartTime: false,
    },
    none: {
      badgeText: "NO FLASH SALE",
      headingText: "Great Deals Coming Soon",
      showTimer: false,
      timerHeading: "",
      stockLabel: "Unavailable",
      stockBarWidth: "0%",
      stockBarMuted: true,
      buttonDisabled: true,
      buttonLabel: "Not Available",
      useStartTime: false,
    },
  };
};

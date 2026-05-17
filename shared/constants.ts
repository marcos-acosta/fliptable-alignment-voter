export const ROOM_NAME = "fliptable";

export const PARTYKIT_HOST =
  process.env.NODE_ENV === "development"
    ? "localhost:1999"
    : "fliptable-vote-party.marcos-acosta.partykit.dev";

export const AXIS_LABELS = {
  top: "data",
  bottom: "based",
  left: "cursed",
  right: "blessed",
};
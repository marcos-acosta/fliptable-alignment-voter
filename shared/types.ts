export interface Point {
  x: number;
  y: number;
}

export type VoteMessage = {
  type: "vote";
  point: Point;
};

export type NewDbMessage = {
  type: "new-db";
  dbName: string;
};

export type ClientToServerMessage = VoteMessage | NewDbMessage;

export type VoteSnapshot = {
  type: "snapshot";
  dbName: string;
  votes: Point[];
  consensus: Point;
};

export type ServerToClientMessage = VoteSnapshot;

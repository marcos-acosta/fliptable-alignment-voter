export interface Point {
  x: number;
  y: number;
}

export type VoteMessage = {
  type: "vote";
  point: Point;
};

export type NewDbMessage = {
  type: "new-db",
  dbName: string;
}

export type ClientToServerMessage = VoteMessage | NewDbMessage;


export type ConsensusMessage = {
  type: "consensus";
  consensus: Point;
  numVoters: number;
};

export type ServerToClientMessage = NewDbMessage | ConsensusMessage;

"use client";

import PartySocket from "partysocket";
import { useEffect, useRef, useState } from "react";
import type {
  NewDbMessage,
  ServerToClientMessage,
  VoteSnapshot,
} from "../../../shared/types";
import AxisPad from "@/components/AxisPad";

export default function AdminPage() {
  const socketRef = useRef<PartySocket | null>(null);
  const [snapshot, setSnapshot] = useState<VoteSnapshot | null>(null);
  const [dbName, setDbName] = useState("");

  useEffect(() => {
    const partySocket = new PartySocket({
      host: "localhost:1999",
      room: "my-room",
    });
    socketRef.current = partySocket;

    partySocket.addEventListener("message", (e) => {
      const msg: ServerToClientMessage = JSON.parse(e.data);
      if (msg.type === "snapshot") {
        setSnapshot(msg);
      }
    });

    return () => partySocket.close();
  }, []);

  const newDatabase = () => {
    const msg: NewDbMessage = { type: "new-db", dbName };
    socketRef.current?.send(JSON.stringify(msg));
  };

  return (
    <div>
      <h1>Admin page</h1>
      <div>DB: {snapshot?.dbName || "(none)"}</div>
      <div>Num voters: {snapshot?.votes.length ?? 0}</div>
      <AxisPad
        labels={{
          top: "good",
          bottom: "evil",
          left: "chaotic",
          right: "lawful",
        }}
        point={snapshot?.consensus}
        points={snapshot?.votes}
        readonly
      />
      <div>
        <input
          type="text"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />
        <button onClick={newDatabase}>New DB</button>
      </div>
    </div>
  );
}

"use client";

import PartySocket from "partysocket";
import { useEffect, useRef, useState } from "react";
import type {
  NewDbMessage,
  ServerToClientMessage,
  VoteSnapshot,
} from "../../../shared/types";
import AxisPad from "@/components/AxisPad";
import { PARTYKIT_HOST, ROOM_NAME } from "../../../shared/constants";
import styles from "./page.module.css";
import { classes } from "@/utils/throttle";

export default function AdminPage() {
  const socketRef = useRef<PartySocket | null>(null);
  const [snapshot, setSnapshot] = useState<VoteSnapshot | null>(null);
  const [dbName, setDbName] = useState("");
  const [copyText, setCopyText] = useState("copy alignment");

  useEffect(() => {
    const partySocket = new PartySocket({
      host: PARTYKIT_HOST,
      room: ROOM_NAME,
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
    setDbName("");
  };

  const copyAlignmentToClipboard = async () => {
    const consensusString = `${snapshot?.consensus.x.toFixed(2)},${snapshot?.consensus.y.toFixed(2)}`;
    await navigator.clipboard.writeText(consensusString);
    setCopyText("copied!");
    setTimeout(() => setCopyText("copy alignment"), 500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.dbNameContainer}>
        <div className={styles.supertitle}>voting on:</div>
        <div className={styles.dbName}>{snapshot?.dbName || "(none)"}</div>
        <div className={styles.subtitle}>
          {snapshot?.votes.length ?? 0} vote
          {(snapshot?.votes.length ?? 0) === 1 ? "" : "s"}
        </div>
      </div>
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
      <div className={styles.actionsContainer}>
        <div className={styles.copyAlignmentContainer}>
          <button
            onClick={copyAlignmentToClipboard}
            className={classes(styles.button, styles.fullWidth)}
          >
            {copyText}
          </button>
        </div>
        <div className={styles.newDbContainer}>
          <input
            type="text"
            value={dbName}
            className={styles.dbNameInput}
            onChange={(e) => setDbName(e.target.value)}
            placeholder="database name"
          />
          <button onClick={newDatabase} className={styles.button}>
            next
          </button>
        </div>
      </div>
    </div>
  );
}

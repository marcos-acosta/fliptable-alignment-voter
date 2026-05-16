"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useRef } from "react";
import PartySocket from "partysocket";
import AxisPad from "../components/AxisPad";
import { throttle } from "../utils/throttle";
import type {
  Point,
  ServerToClientMessage,
  VoteMessage,
} from "../../shared/types";

export default function Home() {
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    const partySocket = new PartySocket({
      host: "localhost:1999",
      room: "my-room",
    });
    socketRef.current = partySocket;

    partySocket.addEventListener("message", (e) => {
      const msg: ServerToClientMessage = JSON.parse(e.data);
      console.log(msg);
    });

    return () => partySocket.close();
  }, []);

  const sendCoordinates = useMemo(
    () =>
      throttle((point: Point) => {
        const msg: VoteMessage = { type: "vote", point };
        socketRef.current?.send(JSON.stringify(msg));
      }, 500),
    [],
  );

  return (
    <div className={styles.page}>
      <AxisPad
        labels={{
          top: "good",
          bottom: "evil",
          left: "chaotic",
          right: "lawful",
        }}
        onChange={sendCoordinates}
      />
    </div>
  );
}

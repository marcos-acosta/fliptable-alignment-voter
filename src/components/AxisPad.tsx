"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import styles from "./AxisPad.module.css";
import type { Point } from "../../shared/types";

interface AxisPadLabels {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

interface AxisPadProps {
  labels?: AxisPadLabels;
  onChange?: (point: Point) => void;
  point?: Point;
  readonly?: boolean;
}

export default function AxisPad(props: AxisPadProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [internalPoint, setInternalPoint] = useState({ x: 0, y: 0 });
  const point = props.point ?? internalPoint;

  const updateFromEvent = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const box = boxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const next = {
        x: Math.max(-1, Math.min(1, rawX)),
        y: Math.max(-1, Math.min(1, rawY)),
      };
      setInternalPoint(next);
      props.onChange?.(next);
    },
    [props.onChange],
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromEvent(e);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerEvent = (
    e: PointerEvent<HTMLDivElement>,
    callback: (e: PointerEvent<HTMLDivElement>) => void,
  ) => {
    if (!props.readonly) {
      callback(e);
    }
  };

  const pointStyle = { "--x": point.x, "--y": point.y } as CSSProperties;

  return (
    <div className={styles.container}>
      <div className={styles.top}>{props.labels?.top}</div>
      <div className={styles.left}>{props.labels?.left}</div>
      <div
        ref={boxRef}
        className={styles.box}
        onPointerDown={(e) => handlePointerEvent(e, handlePointerDown)}
        onPointerMove={(e) => handlePointerEvent(e, handlePointerMove)}
        onPointerUp={(e) => handlePointerEvent(e, handlePointerUp)}
        onPointerCancel={(e) => handlePointerEvent(e, handlePointerUp)}
      >
        <div className={styles.axisX} />
        <div className={styles.axisY} />
        <div className={styles.point} style={pointStyle} />
      </div>
      <div className={styles.right}>{props.labels?.right}</div>
      <div className={styles.bottom}>{props.labels?.bottom}</div>
    </div>
  );
}

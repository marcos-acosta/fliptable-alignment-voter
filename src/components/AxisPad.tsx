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
  points?: Point[];
  readonly?: boolean;
}

const toStyle = (p: Point): CSSProperties =>
  ({ "--x": p.x, "--y": p.y }) as CSSProperties;

export default function AxisPad(props: AxisPadProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [internalPoint, setInternalPoint] = useState<Point>({ x: 0, y: 0 });
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
    if (props.readonly) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (props.readonly || !draggingRef.current) return;
    updateFromEvent(e);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (props.readonly) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>{props.labels?.top}</div>
      <div className={styles.left}>{props.labels?.left}</div>
      <div
        ref={boxRef}
        className={styles.box}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.axisX} />
        <div className={styles.axisY} />
        {props.points?.map((p, i) => (
          <div key={i} className={styles.smallPoint} style={toStyle(p)} />
        ))}
        <div className={styles.point} style={toStyle(point)} />
      </div>
      <div className={styles.right}>{props.labels?.right}</div>
      <div className={styles.bottom}>{props.labels?.bottom}</div>
    </div>
  );
}

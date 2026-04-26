"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CaseStatus, type WebSocketCaseEvent } from "@/types/case.types";
import { useNotificationStore } from "@/store/notificationStore";

interface UseWebSocketReturn {
  lastMessage: WebSocketCaseEvent | null;
  connectionStatus: "connected" | "disconnected";
}

/**
 * Simulates WebSocket-like behavior for case status updates.
 * In mock mode: uses setInterval to simulate status progression:
 *   processing (after 2s) → awaiting_review (after 5s)
 * Dispatches to notificationStore when report_ready.
 */
export function useWebSocket(caseId: string | null): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<WebSocketCaseEvent | null>(
    null,
  );
  const connectionStatus: UseWebSocketReturn["connectionStatus"] = caseId
    ? "connected"
    : "disconnected";
  const addNotification = useNotificationStore((s) => s.addNotification);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!caseId) {
      cleanup();
      return;
    }
    stepRef.current = 0;

    const statusProgression: Array<{
      delay: number;
      status: CaseStatus;
      type: WebSocketCaseEvent["type"];
    }> = [
      { delay: 2000, status: CaseStatus.PROCESSING, type: "status_update" },
      { delay: 5000, status: CaseStatus.AWAITING_REVIEW, type: "report_ready" },
    ];

    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex >= statusProgression.length) {
        cleanup();
        return;
      }

      const step = statusProgression[stepIndex];
      stepIndex++;

      setTimeout(() => {
        const event: WebSocketCaseEvent = {
          type: step.type,
          caseId,
          status: step.status,
          timestamp: new Date().toISOString(),
        };

        setLastMessage(event);

        if (step.type === "report_ready") {
          addNotification({
            type: "success",
            title: "Report Ready",
            message: `Analysis complete for case ${caseId}. Ready for review.`,
          });
        }

        advanceStep();
      }, step.delay);
    };

    advanceStep();

    return cleanup;
  }, [caseId, addNotification, cleanup]);

  return { lastMessage, connectionStatus };
}

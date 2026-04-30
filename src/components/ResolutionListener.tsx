"use client";

import { useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/Toast";

export default function ResolutionListener() {
  const { onResolution } = useWallet();
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onResolution((r) => {
      const shortQuestion =
        r.marketQuestion.length > 50
          ? r.marketQuestion.slice(0, 50) + "..."
          : r.marketQuestion;

      if (r.won) {
        showToast(
          `🎉 Voce ganhou +$${r.payout.toFixed(2)}! "${shortQuestion}"`,
          "success"
        );
      } else {
        showToast(
          `😞 Perdeu $${r.totalInvested.toFixed(2)}: "${shortQuestion}"`,
          "error"
        );
      }
    });
    return unsub;
  }, [onResolution, showToast]);

  return null;
}

"use client";

import { useState, useEffect, useRef } from "react";

interface CameraFeedProps {
  youtubeId: string;
  youtubeIds?: string[];
  cameraName: string;
  className?: string;
}

export default function CameraFeed({
  youtubeId,
  youtubeIds,
  cameraName,
  className = "",
}: CameraFeedProps) {
  // Lista de IDs pra tentar (primeiro o principal, depois os fallbacks)
  const allIds = youtubeIds && youtubeIds.length > 0 ? youtubeIds : [youtubeId];
  const [currentIdIndex, setCurrentIdIndex] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentId = allIds[currentIdIndex];

  // Tenta proximo ID se o atual falhar
  const tryNextId = () => {
    if (currentIdIndex < allIds.length - 1) {
      setCurrentIdIndex((i) => i + 1);
      setLoadFailed(false);
      setIsLoading(true);
    } else {
      setLoadFailed(true);
      setIsLoading(false);
    }
  };

  // Verifica se o video existe via oembed (server-side check seria melhor, mas isso eh client)
  useEffect(() => {
    setIsLoading(true);
    setLoadFailed(false);

    // Timeout pra detectar se o iframe demorou demais (provavelmente quebrado)
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [currentId]);

  // Listener pra mensagens do iframe do YouTube (deteccao de erro)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onError" || data.info?.errorCode) {
          tryNextId();
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdIndex]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!loadFailed && (
          <iframe
            ref={iframeRef}
            key={currentId}
            src={`https://www.youtube.com/embed/${currentId}?autoplay=1&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title={cameraName}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={tryNextId}
          />
        )}

        {/* Loading overlay */}
        {isLoading && !loadFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Conectando ao stream...</p>
            </div>
          </div>
        )}

        {/* Stream offline */}
        {loadFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Stream offline</p>
              <p className="text-gray-500 text-sm mb-4">
                Todos os IDs de fallback falharam ({allIds.length} tentados)
              </p>
              <button
                onClick={() => {
                  setCurrentIdIndex(0);
                  setLoadFailed(false);
                  setIsLoading(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live badge */}
      {!loadFailed && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold uppercase tracking-wider">AO VIVO</span>
        </div>
      )}

      {/* Camera name + ID indicator */}
      {!loadFailed && (
        <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center justify-between">
          <p className="text-white text-sm font-medium truncate">{cameraName}</p>
          {allIds.length > 1 && (
            <span className="text-gray-400 text-[10px] shrink-0 ml-2">
              {currentIdIndex + 1}/{allIds.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

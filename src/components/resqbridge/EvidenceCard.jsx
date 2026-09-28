import React, { useEffect, useState } from "react";
import { X, FileText, Mic } from "lucide-react";
import { Image } from "@/components/ui/image";
import { getSignedUrl } from "@/services/fileService";

export default function EvidenceCard({ item, onRemove }) {
  const [signedUrl, setSignedUrl] = useState(null);

  useEffect(() => {
    if (item.type === "image" && item.url) {
      getSignedUrl(item.url).then(setSignedUrl).catch(() => {});
    }
  }, [item.type, item.url]);

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/60 bg-white/60 flex items-center justify-center">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 z-10 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {item.type === "image" && (signedUrl ? <Image src={signedUrl} alt={item.name} className="w-full h-full" /> : <div className="w-full h-full bg-slate-200 animate-pulse" />)}
      {item.type === "audio" && (
        <div className="flex flex-col items-center gap-1 text-rq-primary">
          <Mic className="w-7 h-7" />
          <span className="text-[10px] text-rq-muted">{item.name}</span>
        </div>
      )}
      {item.type === "note" && (
        <div className="flex flex-col items-center gap-1 text-rq-muted p-2 text-center">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] line-clamp-3">{item.text}</span>
        </div>
      )}
    </div>
  );
}
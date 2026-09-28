import React from "react";
import { MapPin, Phone, Navigation, CheckCircle2 } from "lucide-react";
import GlassCard from "./GlassCard";
import StatusBadge from "./StatusBadge";
import { Image } from "@/components/ui/image";

export default function HospitalCard({ hospital, selected, onSelect, closest }) {
  return (
    <GlassCard
      onClick={onSelect}
      className={`flex gap-3 items-center ${selected ? "ring-2 ring-rq-primary" : ""}`}
    >
      <Image
        src={hospital.image_url || "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=200"}
        alt={hospital.name}
        className="w-16 h-16 rounded-xl flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-rq-navy truncate">{hospital.name}</p>
          {closest && <StatusBadge variant="danger" dot={false}>Closest</StatusBadge>}
          {selected && <CheckCircle2 className="w-4 h-4 text-rq-primary flex-shrink-0" />}
        </div>
        <p className="text-xs text-rq-muted flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {hospital.distance_km} km • {hospital.eta_min} min
        </p>
        <StatusBadge variant={hospital.status === "emergency_ready" ? "success" : "warning"} className="mt-1.5">
          {hospital.status === "emergency_ready" ? "Emergency Ready" : "High Load"} · 24/7
        </StatusBadge>
      </div>
      <div className="flex flex-col gap-1.5">
        <a
          href={`tel:${hospital.phone || ""}`}
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full bg-rq-primary/10 text-rq-primary flex items-center justify-center"
        >
          <Phone className="w-4 h-4" />
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full bg-rq-cyan/10 text-rq-cyan flex items-center justify-center"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>
    </GlassCard>
  );
}
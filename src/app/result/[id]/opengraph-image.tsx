import { ImageResponse } from "next/og";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

interface SessionData {
  name: string;
  primary_type: string;
  secondary_type: string;
  hybrid_name: string;
  dimension_scores: any;
}

// Subtitles map for OG image text
const getSubtitle = (type: string) => {
  const map: Record<string, string> = {
    "seer": "The Visionary",
    "forge": "The Builder",
    "mirror": "The Empath",
    "compass": "The Strategist",
    "herald": "The Voice",
    "anchor": "The Grounding"
  };
  return map[type] || "The PM";
};

// Generate points for the hexagon radar given dimension scores
const getHexagonPoints = (scores: any) => {
  const maxScore = 20; // Assuming 20 is the max possible score on any dimension
  
  // Hardcoded dimension order corresponding to axes
  const dims = ["seer", "forge", "mirror", "compass", "herald", "anchor"];
  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  // Regular hexagon for missing/fallback data
  const fallbackValues = [1, 1, 1, 1, 1, 1]; 
  
  let useFallback = false;
  if (!scores) {
    useFallback = true;
  } else {
    // Check if any dimension is missing
    dims.forEach(d => {
      if (scores[d] === undefined) useFallback = true;
    });
  }

  const valuesToUse = useFallback ? fallbackValues : dims.map(d => Math.min(Math.max(scores[d] / maxScore, 0.1), 1)); // between 0.1 and 1
  
  const points = dims.map((_, i) => {
    // Top axis is 0, descending clockwise
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    const value = valuesToUse[i];
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    return { x, y };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  // Axes calculations
  const axes = dims.map((_, i) => {
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  });

  return { pointsString, axes, points };
};

export default async function Image({ params }: { params: { id: string } }) {
  let data: SessionData | null = null;
  
  try {
    const docRef = doc(db, "sessions", params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      data = docSnap.data() as SessionData;
    }
  } catch (err) {
    console.error("Failed to fetch session for OG image:", err);
  }

  // Fallback defaults if ID not found
  const name = data?.name || "Someone";
  const primaryName = data?.primary_type ? `The ${data.primary_type.charAt(0).toUpperCase() + data.primary_type.slice(1)}` : "The PM";
  const primarySubtitle = data?.primary_type ? getSubtitle(data.primary_type) : "The Unknown";
  
  const secondaryName = data?.secondary_type ? `The ${data.secondary_type.charAt(0).toUpperCase() + data.secondary_type.slice(1)}` : "The Contributor";
  const secondarySubtitle = data?.secondary_type ? getSubtitle(data.secondary_type) : "The Maker";

  const hybrid = data?.hybrid_name || "The Hybrid";
  const scores = data?.dimension_scores || null;

  const { pointsString, axes, points } = getHexagonPoints(scores);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0A0A0A",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          color: "#F5F0E8",
          fontFamily: "Inter, sans-serif"
        }}
      >
        {/* Radial Ambient Glow - LAMP effect equivalent */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background: "radial-gradient(ellipse at center, rgba(196,92,58,0.4) 0%, rgba(10,10,10,0) 70%)",
          }}
        />

        {/* LEFT COMPARTMENT - 60% */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "60%",
            padding: "80px",
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#C45C3A",
                textTransform: "uppercase",
                letterSpacing: "4px",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "30px",
              }}
            >
              ORLOG — PM PERSONALITY TEST
            </span>
            <span style={{ fontSize: "28px", color: "#F5F0E8", marginBottom: "16px" }}>
              {name}'s PM Type
            </span>
            
            <span style={{ fontSize: "56px", fontWeight: "bold", color: "#F5F0E8", lineHeight: "1.1", marginBottom: "8px" }}>
              {primaryName}
            </span>
            <span style={{ fontSize: "24px", color: "#C45C3A", fontStyle: "italic", marginBottom: "32px" }}>
              {primarySubtitle}
            </span>

            <span style={{ fontSize: "16px", color: "#8A8480", marginBottom: "20px" }}>
              with traits of {secondaryName} — {secondarySubtitle}
            </span>

            {/* Hybrid badge */}
            <div style={{ display: "flex" }}>
              <div
                style={{
                  backgroundColor: "#4A7C6F",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: "999px",
                  fontSize: "18px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {hybrid}
              </div>
            </div>
          </div>

          <div
            style={{
              color: "#4A4540",
              fontSize: "14px",
              fontWeight: 500
            }}
          >
            orlog.fourg.dev
          </div>
        </div>

        {/* RIGHT COMPARTMENT - 40% (RADAR CHART) */}
        <div
          style={{
            display: "flex",
            width: "40%",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10
          }}
        >
          {/* 400x400 SVG canvas for radar */}
          <div style={{ display: "flex", position: "relative" }}>
            <svg width="400" height="400" viewBox="0 0 400 400" style={{ display: "flex" }}>
              
              {/* Central cross-hair axes */}
              {axes.map((axis, i) => (
                <line
                  key={`axis-${i}`}
                  x1="200"
                  y1="200"
                  x2={axis.x}
                  y2={axis.y}
                  stroke="#2A2A2A"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Background structural hexagon bounds */}
              <polygon
                points={axes.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#2A2A2A"
                strokeWidth="2"
              />

              {/* The actual filled chart area */}
              <polygon
                points={pointsString}
                fill="rgba(196,92,58,0.4)"
                stroke="#C45C3A"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* The data points on intersecting axes */}
              {points.map((p, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#4A7C6F"
                />
              ))}

              {/* Labels */}
              <text x="200" y="30" fill="#8A8480" fontSize="12" textAnchor="middle">Seer</text>
              <text x="370" y="110" fill="#8A8480" fontSize="12" textAnchor="start">Forge</text>
              <text x="370" y="300" fill="#8A8480" fontSize="12" textAnchor="start">Mirror</text>
              <text x="200" y="380" fill="#8A8480" fontSize="12" textAnchor="middle">Compass</text>
              <text x="30" y="300" fill="#8A8480" fontSize="12" textAnchor="end">Herald</text>
              <text x="30" y="110" fill="#8A8480" fontSize="12" textAnchor="end">Anchor</text>
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface SessionData {
  primary_type: string;
  secondary_type: string;
  hybrid_name: string;
  name: string;
}

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  let title = "Orlog PM Test Result";
  let description = "Discover your PM personality type on Orlog.";
  
  try {
    const docRef = doc(db, "sessions", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SessionData;
      const primaryName = data.primary_type ? `The ${data.primary_type.charAt(0).toUpperCase() + data.primary_type.slice(1)}` : "The PM";
      const secondaryName = data.secondary_type ? `The ${data.secondary_type.charAt(0).toUpperCase() + data.secondary_type.slice(1)}` : "The Contributor";
      
      const primarySub = getSubtitle(data.primary_type);
      const secondarySub = getSubtitle(data.secondary_type);
      
      title = `${data.name}'s PM Type — ${data.hybrid_name} | Orlog`;
      description = `I'm ${primaryName} (${primarySub}) × ${secondaryName} (${secondarySub}). Discover your exactly what kind of PM you are on Orlog.`;
    }
  } catch (err) {
    console.error("Failed to fetch session metadata:", err);
  }

  // The base URL. We'll rely on the domain we deploy to or locally
  const ogUrl = `/result/${id}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogUrl],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl]
    }
  };
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export const PM_TYPES = {
    seer: {
        key: "seer",
        name: "The Seer",
        subtitle: "The Visionary",
        color: "#C4973A",
        tagline: "Thinks in futures and possibilities",
        description: "You think in futures. Where others see the present, you see what could be. Your superpower is vision — you pull people toward a compelling tomorrow.",
        strengths: ["Visionary thinking", "Inspiring others", "Spotting trends early"],
        blindSpots: ["Can lose sight of near-term execution", "May overlook operational detail"],
        famousPMs: [
            { name: "Steve Jobs", company: "Apple", note: "Known for obsessive product vision and taste-driven decisions" },
            { name: "Elon Musk", company: "Tesla / SpaceX", note: "Bets on futures others consider impossible" }
        ]
    },
    forge: {
        key: "forge",
        name: "The Forge",
        subtitle: "The Builder",
        color: "#C45C3A",
        tagline: "Ships fast and executes with discipline",
        description: "You ship. While others debate, you execute. Your superpower is turning plans into reality with discipline and relentless follow-through.",
        strengths: ["Reliable delivery", "Scope management", "Execution under pressure"],
        blindSpots: ["Can prioritise shipping over strategy", "May miss the bigger picture"],
        famousPMs: [
            { name: "Jeff Bezos", company: "Amazon", note: "Famous for operational rigour and delivery at scale" },
            { name: "Sundar Pichai", company: "Google", note: "Known for calm, systematic execution across complex orgs" }
        ]
    },
    mirror: {
        key: "mirror",
        name: "The Warden",
        subtitle: "The Advocate",
        color: "#4A7C6F",
        tagline: "Guards the user above everything else",
        description: "You are the user's voice in every room. You listen deeply, empathize genuinely, and refuse to ship things that hurt the people you serve.",
        strengths: ["Deep user empathy", "Customer advocacy", "Qualitative research"],
        blindSpots: ["Can over-index on individual feedback", "May struggle with hard business trade-offs"],
        famousPMs: [
            { name: "Stewart Butterfield", company: "Slack", note: "Built products by obsessing over how people actually work" },
            { name: "Brian Chesky", company: "Airbnb", note: "Famous for living the user experience firsthand" }
        ]
    },
    compass: {
        key: "compass",
        name: "The Sage",
        subtitle: "The Analyst",
        color: "#3A5C7C",
        tagline: "Finds truth in data and patterns",
        description: "You let data lead. You find truth in numbers, build rigorous frameworks, and make decisions others can trust because the evidence is always there.",
        strengths: ["Data rigour", "Hypothesis-driven thinking", "Metric definition"],
        blindSpots: ["Can suffer analysis paralysis", "May undervalue qualitative signals"],
        famousPMs: [
            { name: "Marissa Mayer", company: "Google", note: "Known for data-driven product decisions at scale" },
            { name: "Kevin Systrom", company: "Instagram", note: "Used metrics to make bold, defensible product calls" }
        ]
    },
    herald: {
        key: "herald",
        name: "The Weaver",
        subtitle: "The Diplomat",
        color: "#6B4A7C",
        tagline: "Connects people and builds alignment",
        description: "You connect people. Your superpower is alignment — you make cross-functional teams feel like one team, and complex org dynamics feel manageable.",
        strengths: ["Stakeholder alignment", "Cross-functional trust", "Conflict resolution"],
        blindSpots: ["Can avoid necessary conflict", "May slow down decisions by over-seeking consensus"],
        famousPMs: [
            { name: "Sheryl Sandberg", company: "Meta", note: "Master of organisational alignment and stakeholder management" },
            { name: "Satya Nadella", company: "Microsoft", note: "Transformed culture through empathy and cross-team collaboration" }
        ]
    },
    anchor: {
        key: "anchor",
        name: "The Sovereign",
        subtitle: "The Founder",
        color: "#3A3530",
        tagline: "Owns everything, decides fast",
        description: "You own it. You act like a founder, move fast, take accountability, and rarely wait for permission. Where others hesitate, you decide.",
        strengths: ["Ownership mindset", "Fast decision-making", "Founder-level accountability"],
        blindSpots: ["Can be too independent", "May underinvest in alignment and buy-in"],
        famousPMs: [
            { name: "Jensen Huang", company: "Nvidia", note: "Runs the company with total ownership and long-term conviction" },
            { name: "Patrick Collison", company: "Stripe", note: "Known for high ownership culture and fast decisive action" }
        ]
    }
};

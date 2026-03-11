export interface Chapter {
  id: number;
  title: string;
  theme: "terracotta" | "sage" | "gold" | "white";
  color: string;
  scene: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "The Strategy Session",
    theme: "terracotta",
    color: "#C45C3A",
    scene: "Day 3 at NovaCorp. The CEO just put the 3-year roadmap on the table. Engineering says it's unrealistic. Marketing wants more features. Leadership is watching you closely."
  },
  {
    id: 2,
    title: "The Sprint Crisis",
    theme: "terracotta",
    color: "#C45C3A",
    scene: "Week 2. A competitor just shipped your flagship feature. The team is in panic mode. Your engineering lead says you're 6 months behind. You have 48 hours to decide how to respond."
  },
  {
    id: 3,
    title: "The Customer Call",
    theme: "sage",
    color: "#4A7C6F",
    scene: "Your biggest customer just flagged a serious problem. Support tickets are climbing. The data looks fine but your gut says something is wrong. Five decisions stand between you and the answer."
  },
  {
    id: 4,
    title: "The Stakeholder War Room",
    theme: "sage",
    color: "#4A7C6F",
    scene: "Quarterly planning. Finance wants revenue features. Design wants to clear UX debt. Sales wants enterprise functionality. One roadmap slot remains. Everyone is in this room waiting for your call."
  },
  {
    id: 5,
    title: "The Pivot Decision",
    theme: "gold",
    color: "#C4973A",
    scene: "Month 6. Growth has stalled. The board is asking hard questions. A bold pivot is on the table alongside a case for staying the course. The decision lands on your desk."
  },
  {
    id: 6,
    title: "The Final Review",
    theme: "white",
    color: "#F5F0E8",
    scene: "End of year. You're presenting to the board. Every call you made, every trade-off you chose — it all comes down to how you lead in this room, right now."
  }
];

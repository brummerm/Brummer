// Add a new tile by appending to this list. Each entry renders as a card on the
// dashboard. The dashboard does not import or run app code; it just links out.
window.APPS = [
  {
    id: "meal-planner",
    title: "Meal Planner",
    desc: "Recipes, weekly plans, and grocery lists.",
    icon: "🍳",
    href: "/apps/meal-planner/",
    enabled: true,
  },
  {
    id: "budget",
    title: "Budget Tracker",
    desc: "Monthly budget, surplus allocation, and retirement balances.",
    icon: "💰",
    href: "/apps/budget/",
    enabled: true,
  },
  {
    id: "fitness",
    title: "Fitness Tracker",
    desc: "12-week training plan with workout logging.",
    icon: "🏋️",
    href: "/apps/fitness/",
    enabled: true,
  },
  {
    id: "travel-planner",
    title: "Travel Planner",
    desc: "Plan trips with itineraries, packing lists, and budgets.",
    icon: "✈️",
    href: "/apps/travel-planner/",
    enabled: true,
  },
  {
    id: "tickets",
    title: "Tickets",
    desc: "Track tasks and issues with a Kanban board.",
    icon: "🎫",
    href: "/apps/tickets/",
    enabled: true,
  },
];

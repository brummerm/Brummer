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
  // Future apps go here. Set enabled: false to render a placeholder tile.
];

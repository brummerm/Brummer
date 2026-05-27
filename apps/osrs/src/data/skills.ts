import type { SkillGuide } from '../types'

// XP required to reach level 99
export const XP_99 = 13_034_431

// Lookup: OSRS XP table (level → total XP)
const XP_TABLE: Record<number, number> = {
  1: 0, 2: 83, 3: 174, 4: 276, 5: 388, 6: 512, 7: 650, 8: 801, 9: 969, 10: 1154,
  11: 1358, 12: 1584, 13: 1833, 14: 2107, 15: 2411, 16: 2746, 17: 3115, 18: 3523,
  19: 3973, 20: 4470, 21: 5018, 22: 5624, 23: 6291, 24: 7028, 25: 7842, 26: 8740,
  27: 9730, 28: 10824, 29: 12031, 30: 13363, 31: 14833, 32: 16456, 33: 18247,
  34: 20224, 35: 22406, 36: 24815, 37: 27473, 38: 30408, 39: 33648, 40: 37224,
  41: 41171, 42: 45529, 43: 50339, 44: 55649, 45: 61512, 46: 67983, 47: 75127,
  48: 83014, 49: 91721, 50: 101333, 51: 111945, 52: 123660, 53: 136594, 54: 150872,
  55: 166636, 56: 184040, 57: 203254, 58: 224466, 59: 247886, 60: 273742, 61: 301288,
  62: 330797, 63: 362559, 64: 395900, 65: 431152, 66: 468665, 67: 507905, 68: 549278,
  69: 593239, 70: 640305, 71: 689993, 72: 742850, 73: 799447, 74: 859385, 75: 923302,
  76: 990880, 77: 1_061_912, 78: 1_136_294, 79: 1_214_977, 80: 1_298_046, 81: 1_385_609,
  82: 1_477_802, 83: 1_574_897, 84: 1_677_040, 85: 1_784_508, 86: 1_897_596,
  87: 2_016_683, 88: 2_142_202, 89: 2_274_614, 90: 2_414_443, 91: 2_562_267,
  92: 2_718_704, 93: 2_883_425, 94: 3_057_165, 95: 3_240_761, 96: 3_435_134,
  97: 3_641_218, 98: 3_859_532, 99: XP_99,
}

export function xpForLevel(level: number): number {
  return XP_TABLE[Math.min(99, Math.max(1, level))] ?? 0
}

export function xpToNext99(currentXp: number): number {
  return Math.max(0, XP_99 - currentXp)
}

export const SKILL_GUIDES: SkillGuide[] = [
  // ── Already maxed ──────────────────────────────────────────────────────────
  {
    skill: 'Hitpoints', icon: '❤️', phase: 3, alreadyMaxed: true,
    estimatedHoursTotal: 0, gpNet: 0,
    methods: [{ label: '99 via combat', xpPerHour: 0, clickIntensity: 'low', notes: 'Already 99.' }],
    tips: 'Already capped. HP XP is a byproduct of combat — keeps itself topped up.',
  },
  {
    skill: 'Ranged', icon: '🏹', phase: 3, alreadyMaxed: true,
    estimatedHoursTotal: 0, gpNet: 0,
    methods: [{ label: '99 already', xpPerHour: 0, clickIntensity: 'low', notes: 'Already 99.' }],
    tips: 'Already 99. Use your blowpipe/bow freely on Slayer tasks.',
  },
  {
    skill: 'Magic', icon: '🔮', phase: 3, alreadyMaxed: true,
    estimatedHoursTotal: 0, gpNet: 0,
    methods: [{ label: '99 already', xpPerHour: 0, clickIntensity: 'low', notes: 'Already 99.' }],
    tips: 'Already 99. Use Arceuus spells freely for passive XP boosts.',
  },
  {
    skill: 'Fletching', icon: '🪶', phase: 1, alreadyMaxed: true,
    estimatedHoursTotal: 0, gpNet: 0,
    methods: [{ label: '99 already', xpPerHour: 0, clickIntensity: 'low', notes: 'Already 99.' }],
    tips: 'Already 99. Fletch bolts/arrows idle during Slayer for zero extra time.',
  },
  {
    skill: 'Firemaking', icon: '🔥', phase: 1, alreadyMaxed: true,
    estimatedHoursTotal: 0, gpNet: 0,
    methods: [{ label: '99 already', xpPerHour: 0, clickIntensity: 'low', notes: 'Already 99.' }],
    tips: 'Already 99. Wintertodt gave you a good loot stack — sell anything you no longer need.',
  },

  // ── Phase 1 — Quick Wins ───────────────────────────────────────────────────
  {
    skill: 'Farming', icon: '🌿', phase: 1, alreadyMaxed: false,
    estimatedHoursTotal: 0,
    gpNet: 3_000,
    methods: [
      {
        label: 'Daily herb + tree runs (passive)',
        xpPerHour: 0,
        clickIntensity: 'ultra-low',
        notes: '10 herb patches (snapdragon/toadflax) + magic/palm/spirit tree runs every 16 hrs. ~150k XP/day, zero active grind time.',
      },
      {
        label: 'Tithe Farm (active push)',
        xpPerHour: 100_000,
        clickIntensity: 'medium',
        notes: '~100k XP/hr, active minigame. Skip unless you enjoy it.',
      },
    ],
    tips: 'Buy bulk snapdragon seeds for XP, toadflax for profit. Get Farmer\'s outfit from Tithe Farm for +2.5% XP. Magic Secateurs from Fairy Tale Pt 1 are essential. Hespori gives free 12.6k XP every 3 days — never skip it.',
  },
  {
    skill: 'Prayer', icon: '🙏', phase: 1, alreadyMaxed: false,
    estimatedHoursTotal: 57,
    gpNet: -40_000,
    methods: [
      {
        label: 'Sunfire Wine + Bone Shards (Libation Bowl)',
        xpPerHour: 200_000,
        clickIntensity: 'low',
        notes: 'Unnote bones via Virilis (10gp each), bless on Exposed Altar, chisel into shards, use at Libation Bowl. AFK click-once/min = ~200k XP/hr. Dragon bones recommended.',
      },
      {
        label: 'Spam-click Libation Bowl',
        xpPerHour: 350_000,
        clickIntensity: 'medium',
        notes: 'Same setup but click every tick for 250–400k XP/hr.',
      },
      {
        label: 'Ensouled Dragon Heads (Dark Altar)',
        xpPerHour: 80_000,
        clickIntensity: 'ultra-low',
        notes: 'Cheaper option. Cast Reanimate every 5 seconds. ~80k XP/hr. Good budget choice.',
      },
      {
        label: 'Chaos Altar (Wilderness)',
        xpPerHour: 500_000,
        clickIntensity: 'high',
        notes: '500k+ XP/hr with superior dragon bones — ~50% bones saved. PK risk. Optional hard push.',
      },
    ],
    tips: 'Dragon bones at Libation Bowl is the current meta. ~40M GP total with dragon bones. Recharge prayer at the regular altar just south of the Libation Bowl.',
  },
  {
    skill: 'Cooking', icon: '🍳', phase: 1, alreadyMaxed: false,
    estimatedHoursTotal: 20,
    gpNet: -8_000,
    methods: [
      {
        label: "Jugs of Wine (Myth's Guild bank)",
        xpPerHour: 480_000,
        clickIntensity: 'ultra-low',
        notes: 'Withdraw jugs of water + grapes, make wine, bank. 200 XP each. One click per inventory (~23 clicks/hr). Wines sell back for ~80% of cost.',
      },
      {
        label: '1-tick Karambwans (push option)',
        xpPerHour: 800_000,
        clickIntensity: 'high',
        notes: 'Hold 2 karambwans + click on a gravestone tile. 800k+ XP/hr but brutal on fingers. Skip unless you enjoy 1-ticking.',
      },
    ],
    tips: 'Jugs of Wine is one of the most efficient methods in the entire game at near-zero click intensity. 85→99 takes only ~20 hours. Most of cost recovers on GE.',
  },
  {
    skill: 'Construction', icon: '🏠', phase: 1, alreadyMaxed: false,
    estimatedHoursTotal: 9,
    gpNet: -150_000,
    methods: [
      {
        label: 'Mahogany Benches (Demon Butler)',
        xpPerHour: 900_000,
        clickIntensity: 'low',
        notes: 'Demon Butler fetches 26 mahogany planks per trip. Build 2 benches per inventory, alternating key binds 1 (build) and 2 (confirm). ~1.1M XP/hr. ~150M GP total.',
      },
      {
        label: 'Mythical Cape Mounts',
        xpPerHour: 280_000,
        clickIntensity: 'low',
        notes: '3 planks per cape mount, 123 XP each. Better XP/plank than benches. ~90M GP total. Click-light alternative.',
      },
      {
        label: 'Mahogany Homes',
        xpPerHour: 280_000,
        clickIntensity: 'low',
        notes: '~30M GP total. Cheapest method. Gives Carpenter outfit (+2.5% XP). Good for mid-budget players.',
      },
    ],
    tips: 'Get Demon Butler unlock (Love Story quest). Stack ~30k mahogany planks before starting. Rich: mahogany benches. Mid-budget: Mythical capes. Budget: Mahogany Homes contracts.',
  },

  // ── Phase 2 — GP Engine ────────────────────────────────────────────────────
  {
    skill: 'Thieving', icon: '🗝️', phase: 2, alreadyMaxed: false,
    estimatedHoursTotal: 44,
    gpNet: 150_000,
    methods: [
      {
        label: 'Vyres in Darkmeyer',
        xpPerHour: 225_000,
        clickIntensity: 'low',
        notes: 'Best GP + XP combo in the game. ~2.4–3.6M GP/hr. Requires Sins of the Father. Full Rogues outfit doubles loot. Hard Morytania diary gives 10% pickpocket success boost.',
      },
      {
        label: 'Pyramid Plunder (91+)',
        xpPerHour: 270_000,
        clickIntensity: 'high',
        notes: '270k XP/hr at 91+, no GP profit. Very click-heavy. Only useful if you want Pharaoh\'s Sceptre.',
      },
    ],
    tips: 'Do Thieving FIRST — it funds Construction, Herblore, Prayer. Setup: Sins of the Father quest, full Rogues outfit (Rogues Den), Shadow Veil spell (Arceuus), Dodgy necklaces, Hard Morytania diary. At 95 Thieving unlock Vyrelords for even better rates.',
  },

  // ── Phase 3 — Combat ──────────────────────────────────────────────────────
  {
    skill: 'Slayer', icon: '💀', phase: 3, alreadyMaxed: false,
    estimatedHoursTotal: 210,
    gpNet: -5_000,
    methods: [
      {
        label: 'Konar quo Maten rotation (primary)',
        xpPerHour: 50_000,
        clickIntensity: 'medium',
        notes: 'Best for unique drops + boss task variety. Use for 90% of tasks.',
      },
      {
        label: 'Duradel rotation',
        xpPerHour: 55_000,
        clickIntensity: 'medium',
        notes: 'Best raw XP. Use when Konar gives a bad task.',
      },
      {
        label: 'Sulphur Naguas (Perilous Moons)',
        xpPerHour: 170_000,
        clickIntensity: 'low',
        notes: '170k XP/hr melee with Piety. Ultra click-light — ~once/min. Requires Perilous Moons quest. Best method to fill melee XP gaps.',
      },
    ],
    tips: 'Block: Dust Devils, Fossil Wyverns, Mutated Zygomites, Spiritual Creatures. Keep: Nechryael, Smoke Devils, Kraken, Cerberus, Alchemical Hydra, Dagannoth Kings. Key unlocks: Bigger and Badder (150pts), Like a Boss (200pts). Do Perilous Moons quest for Naguas access. Slayer naturally carries Att/Str/Def to ~96+.',
  },
  {
    skill: 'Attack', icon: '⚔️', phase: 3, alreadyMaxed: false,
    estimatedHoursTotal: 0,
    gpNet: 0,
    methods: [
      {
        label: 'Through Slayer (primary)',
        xpPerHour: 50_000,
        clickIntensity: 'medium',
        notes: 'Slayer carries Attack to ~96 naturally. No extra grinding needed until post-Slayer cleanup.',
      },
      {
        label: 'Sulphur Naguas (top-up)',
        xpPerHour: 170_000,
        clickIntensity: 'low',
        notes: '170k XP/hr with Piety. Use after Slayer to close final gap to 99.',
      },
      {
        label: 'NMZ Dharok (ultra-AFK cleanup)',
        xpPerHour: 70_000,
        clickIntensity: 'ultra-low',
        notes: 'Click once every 15 min. 70k XP/hr per stat. 6+ hour sessions. Best for overnight AFK.',
      },
    ],
    tips: 'Train through Slayer. After Slayer: check your level — likely 96-98. Use NMZ Dharok for overnight cleanup or Naguas for speed. Do NOT grind Attack independently — Slayer handles it.',
  },
  {
    skill: 'Strength', icon: '💪', phase: 3, alreadyMaxed: false,
    estimatedHoursTotal: 0,
    gpNet: 0,
    methods: [
      {
        label: 'Through Slayer (primary)',
        xpPerHour: 50_000,
        clickIntensity: 'medium',
        notes: 'Slayer carries Strength to ~97 naturally.',
      },
      {
        label: 'Sulphur Naguas (top-up)',
        xpPerHour: 170_000,
        clickIntensity: 'low',
        notes: '170k XP/hr. Use after Slayer for final gap.',
      },
      {
        label: 'NMZ Dharok (ultra-AFK cleanup)',
        xpPerHour: 70_000,
        clickIntensity: 'ultra-low',
        notes: 'See Attack — same setup. All three stats train simultaneously.',
      },
    ],
    tips: 'See Attack — identical advice. Slayer naturally pushes Str higher than any other melee stat. Focus Slayer for maximum efficiency.',
  },
  {
    skill: 'Defence', icon: '🛡️', phase: 3, alreadyMaxed: false,
    estimatedHoursTotal: 40,
    gpNet: 0,
    methods: [
      {
        label: 'Through Slayer (primary)',
        xpPerHour: 50_000,
        clickIntensity: 'medium',
        notes: 'Slayer carries Defence to ~94 naturally.',
      },
      {
        label: 'NMZ Dharok (cleanup)',
        xpPerHour: 70_000,
        clickIntensity: 'ultra-low',
        notes: 'All melee stats train at once — most AFK 99 path. Set timer for ~15 min.',
      },
    ],
    tips: 'NMZ Dharok setup: full Dharok\'s set, super combat pots, 1k+ absorption pots, rapid heal. Rumble customizable with 5 easy bosses. Drop to 1 HP with rock cake, spam absorptions. Never die, ultra-AFK.',
  },

  // ── Phase 4 — Resource Synergy ────────────────────────────────────────────
  {
    skill: 'Hunter', icon: '🦊', phase: 4, alreadyMaxed: false,
    estimatedHoursTotal: 62,
    gpNet: 15_000,
    methods: [
      {
        label: 'Herbiboar (80+)',
        xpPerHour: 200_000,
        clickIntensity: 'ultra-low',
        notes: 'Fossil Island. Click highlighted tile → click next → harvest. RuneLite plugin shows exactly where to click. Drops ranarrs, snapdragons, toadflax, torstols — feeds Herblore. Best low-effort Hunter in the game.',
      },
      {
        label: 'Red Chinchompas (71–80)',
        xpPerHour: 120_000,
        clickIntensity: 'medium',
        notes: 'Feldip Hills. 100–150k XP/hr. Use to reach 80 for Herbiboar unlock.',
      },
      {
        label: 'Black Chinchompas (Wildy push)',
        xpPerHour: 220_000,
        clickIntensity: 'high',
        notes: '220k+ XP/hr but PK risk in deep Wilderness. Skip unless you have a scout.',
      },
    ],
    tips: 'Herbiboar is your target. Requires Bone Voyage (Fossil Island access). Get Herb Sack (750 Slayer pts) to hold herbs. 71→80 Red chins, then Herbiboar to 99. You\'ll get ~3000 herbs over the grind — directly funds Herblore.',
  },
  {
    skill: 'Herblore', icon: '⚗️', phase: 4, alreadyMaxed: false,
    estimatedHoursTotal: 29,
    gpNet: -90_000,
    methods: [
      {
        label: 'Super Defence (81–90)',
        xpPerHour: 360_000,
        clickIntensity: 'ultra-low',
        notes: '~4 gp/XP. Cheapest in your level range. Make in bank batches.',
      },
      {
        label: 'Super Combat Potions (90–99)',
        xpPerHour: 475_000,
        clickIntensity: 'ultra-low',
        notes: 'High demand, ~9 gp/XP. Better XP rate. Fund with Vyre GP.',
      },
    ],
    tips: 'Funded by Thieving Vyres. Use Amulet of Chemistry (5% chance for extra dose) and Botanist\'s outfit for +1.5% XP. Herbiboar hunter grind feeds your herb supply — self-farming covers a significant portion. ~70–100M total.',
  },
  {
    skill: 'Mining', icon: '⛏️', phase: 4, alreadyMaxed: false,
    estimatedHoursTotal: 210,
    gpNet: 8_000,
    methods: [
      {
        label: 'Motherlode Mine (75–92)',
        xpPerHour: 55_000,
        clickIntensity: 'low',
        notes: 'Gives Prospector outfit (+2.5% XP bonus) and golden nuggets. Get Coal Bag (100 nuggets) — essential for Smithing too. AFK-friendly.',
      },
      {
        label: 'Volcanic Mine (92–99)',
        xpPerHour: 75_000,
        clickIntensity: 'medium',
        notes: '60–90k XP/hr. More active but rewarding — ore packs + broken dragon pick pieces.',
      },
      {
        label: 'Amethyst (75–99, AFK path)',
        xpPerHour: 25_000,
        clickIntensity: 'ultra-low',
        notes: 'Most AFK method. ~2.5M GP/hr passive income. Feed Crafting with amethyst dart tips.',
      },
    ],
    tips: 'Get Prospector outfit ASAP (200 golden nuggets). Pair with Crafting: mine amethyst → chisel dart tips = dual XP. Crystal/Dragon pickaxe for best speed. Varrock armour 3/4 for ore doubling.',
  },
  {
    skill: 'Crafting', icon: '💎', phase: 4, alreadyMaxed: false,
    estimatedHoursTotal: 66,
    gpNet: 0,
    methods: [
      {
        label: 'Amethyst Dart Tips (recommended)',
        xpPerHour: 160_000,
        clickIntensity: 'ultra-low',
        notes: 'Chisel amethyst → dart tips. ~32s AFK per inventory. Break-even or slight profit. Pair with Mining amethyst to self-supply.',
      },
      {
        label: 'Glassblowing (light orbs)',
        xpPerHour: 80_000,
        clickIntensity: 'ultra-low',
        notes: '50s AFK per action. More AFK, slower rate. Good if you hate clicking.',
      },
      {
        label: 'Battlestaves (water/earth)',
        xpPerHour: 300_000,
        clickIntensity: 'medium',
        notes: 'Fastest method but expensive (~10 gp/XP). Best for end-game cash-rich push.',
      },
    ],
    tips: 'Amethyst Dart Tips synergizes perfectly with Mining amethyst. Mine amethyst passively, chisel dart tips at any bank. Near-zero cost and click intensity.',
  },
  {
    skill: 'Woodcutting', icon: '🪓', phase: 4, alreadyMaxed: false,
    estimatedHoursTotal: 130,
    gpNet: 12_000,
    methods: [
      {
        label: 'Redwood Trees (Woodcutting Guild)',
        xpPerHour: 75_000,
        clickIntensity: 'ultra-low',
        notes: 'Most AFK 99 in the game. 4:24 per tree. Use log basket + Forester\'s rations + Lumberjack outfit. Set a 4-minute timer and go do something else.',
      },
      {
        label: 'Sulliusceps (Fossil Island)',
        xpPerHour: 90_000,
        clickIntensity: 'low',
        notes: '80–100k XP/hr. More engaging but requires Bone Voyage.',
      },
      {
        label: '2-tick Teaks (Priffddinas)',
        xpPerHour: 215_000,
        clickIntensity: 'high',
        notes: 'Requires Song of the Elves. 215k+ XP/hr. Sweaty. Skip unless you want speed.',
      },
    ],
    tips: 'Redwoods = most AFK 99 in the game. Run alongside other AFK methods (NMZ, cannonballs). Equip: Crystal/Dragon felling axe, Log basket, Forester\'s rations, Lumberjack outfit. Avoid busy worlds — trees fall faster with multiple choppers.',
  },

  // ── Phase 5 — Profitable AFK ───────────────────────────────────────────────
  {
    skill: 'Smithing', icon: '🔨', phase: 5, alreadyMaxed: false,
    estimatedHoursTotal: 38,
    gpNet: 0,
    methods: [
      {
        label: 'Gold Bars at Blast Furnace',
        xpPerHour: 340_000,
        clickIntensity: 'low',
        notes: 'Goldsmith gauntlets (+56.2 XP/bar) + Ice gloves. Run gold ore → dispenser → bars → bank. ~45 sec per inventory. ~70M GP for 76→99. Usually break-even depending on bar prices.',
      },
      {
        label: 'Cannonballs (ultra-AFK profit)',
        xpPerHour: 13_800,
        clickIntensity: 'ultra-low',
        notes: '13.8k XP/hr but 137k GP/hr profit. Make while doing other AFK skills. Supplies your cannon for Slayer.',
      },
      {
        label: "Giant's Foundry",
        xpPerHour: 120_000,
        clickIntensity: 'medium',
        notes: 'Better XP/bar than BF. Good for ironmen. Minigame-based.',
      },
    ],
    tips: 'Goldsmith gauntlets are from Family Crest quest — do this early. Ice gloves from Ice Queen (Mountain Daughter area). Blast Furnace has no fee at 60+ Smithing. Stack gold ore before sessions for efficiency.',
  },
  {
    skill: 'Fishing', icon: '🎣', phase: 5, alreadyMaxed: false,
    estimatedHoursTotal: 180,
    gpNet: 30_000,
    methods: [
      {
        label: 'Tempoross (74–90)',
        xpPerHour: 70_000,
        clickIntensity: 'low',
        notes: 'Boss-style fishing minigame. Drops Spirit angler outfit (+2.5% XP), Fish barrel, Tackle box. Chase outfit pieces (~80–100 games). Great fun for the XP rate.',
      },
      {
        label: "Minnows at Kylie's Platform (90–99)",
        xpPerHour: 50_000,
        clickIntensity: 'ultra-low',
        notes: 'Near-AFK. Requires full Spirit angler outfit. Converts to raw Sharks. Good steady income.',
      },
    ],
    tips: 'Always do Tempoross until you have the full Spirit angler outfit and Fish barrel. The barrel holds 28 extra fish and the outfit gives permanent bonuses. Dragon harpoon (1/8000 from Tempoross rewards) gives a fishing speed boost from its spec.',
  },

  // ── Phase 6 — Final Boss Skills ────────────────────────────────────────────
  {
    skill: 'Runecraft', icon: '🌀', phase: 6, alreadyMaxed: false,
    estimatedHoursTotal: 200,
    gpNet: 80_000,
    methods: [
      {
        label: 'Guardians of the Rift (67–90)',
        xpPerHour: 55_000,
        clickIntensity: 'low',
        notes: 'Best method: get Colossal Pouch (needs abyssal needle, 1/300 drop) and Raiments of the Eye outfit (+10% essence/trip). Pet rolls, tiered runes scale with level.',
      },
      {
        label: 'Blood Runes (Arceuus, 77+)',
        xpPerHour: 45_000,
        clickIntensity: 'low',
        notes: '40–50k XP/hr with good profit from blood rune sales. AFK-friendly alternative to GotR.',
      },
      {
        label: 'Soul Runes (90–99)',
        xpPerHour: 30_000,
        clickIntensity: 'low',
        notes: 'Best GP/hr of all RC methods. Mix with GotR for variety.',
      },
      {
        label: 'ZMI + Daeyalt Essence (push option)',
        xpPerHour: 130_000,
        clickIntensity: 'high',
        notes: 'Pre-mine 5000+ Daeyalt essence at Meiyerditch mine (very AFK, 1 click/min). Then ZMI altar for 130k+ XP/hr. Best for ironmen or players who want max speed.',
      },
    ],
    tips: 'Runecraft is your longest grind (~200 hrs). Key unlocks: Temple of the Eye quest, Colossal Pouch from GotR, Raiments of the Eye outfit. Get abyssal needle early from GotR — the Colossal pouch dramatically speeds up trips. GotR 67→95, then Bloods/Souls to 99 for profit.',
  },
  {
    skill: 'Agility', icon: '🏃', phase: 6, alreadyMaxed: false,
    estimatedHoursTotal: 155,
    gpNet: 60_000,
    methods: [
      {
        label: 'Ardougne Rooftop (77→99)',
        xpPerHour: 60_000,
        clickIntensity: 'low',
        notes: '~60k XP/hr, near-AFK between obstacles. Marks of grace for graceful. Works all the way to 99 — brain-off method.',
      },
      {
        label: 'Hallowed Sepulchre Floor 4 (82–92)',
        xpPerHour: 80_000,
        clickIntensity: 'medium',
        notes: '~80k XP/hr + ~1M GP/hr from Grand Coffin loot. Learn mechanics on Floor 3 first. RuneLite HS plugin highlights all jumps.',
      },
      {
        label: 'Hallowed Sepulchre Floor 5 (92–99)',
        xpPerHour: 95_000,
        clickIntensity: 'medium',
        notes: 'Best XP rate. ~85–100k XP/hr + Grand Coffin loot. Target once you\'re comfortable with Floor 4.',
      },
      {
        label: "Wim's Course (Varlamore Advanced)",
        xpPerHour: 40_000,
        clickIntensity: 'low',
        notes: 'Newer course, less crowded. 20-second AFK windows. Brain-off alternative to Ardougne.',
      },
    ],
    tips: 'Agility is saved for last because Sepulchre loot (Ring of Endurance, dark dye, marks of grace) retains value as a late reward. Required gear: Bullseye lantern (light), Crossbow + Mith grapple (for Sepulchre). Use RuneLite Hallowed Sepulchre plugin — it highlights every jump.',
  },
]

// Ordered skill list matching OSRS hiscores API
export const SKILL_ORDER = [
  'Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
  'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking',
  'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving',
  'Slayer', 'Farming', 'Runecraft', 'Hunter', 'Construction',
]

export function getGuide(skillName: string): SkillGuide | undefined {
  return SKILL_GUIDES.find(g => g.skill === skillName)
}

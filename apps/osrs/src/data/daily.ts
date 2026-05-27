import type { DailyTask } from '../types'

export const DAILY_TASKS: DailyTask[] = [
  // Morning
  {
    id: 'herb-run-am',
    label: 'Morning herb run',
    category: 'morning',
    detail: '10 patches: Catherby, Ardy, Falador, Morytania, Hosidius, Farming Guild, Troll Stronghold, Harmony, Weiss, Varlamore. Snapdragon for XP, Toadflax for profit.',
    xpGain: '~90k Farming XP',
  },
  {
    id: 'tree-run',
    label: 'Tree run (every 16 hrs)',
    category: 'morning',
    detail: 'Magic trees + Palms + Spirit trees + Redwood. Every ~16 hours. ~50k XP per run.',
    xpGain: '~50k Farming XP',
  },
  {
    id: 'birdhouses',
    label: 'Bird houses (Fossil Island)',
    category: 'morning',
    detail: '4 spots on Fossil Island. Collect + reset every ~50 min. Free Hunter XP + seeds + nests. Use redwood birdhouses for best XP.',
    xpGain: 'Free Hunter XP',
  },
  {
    id: 'farming-guild',
    label: 'Farming Guild contract',
    category: 'morning',
    detail: 'Pick up a contract from Guildmaster Jane. ~5 mins. Bonus XP on top of your daily runs.',
    xpGain: 'Bonus Farming XP',
  },
  // Evening
  {
    id: 'herb-run-pm',
    label: 'Evening herb run',
    category: 'evening',
    detail: 'Second run of the day — herbs grow in ~80 min so two runs/day is optimal. Same 10 patches.',
    xpGain: '~90k Farming XP',
  },
  {
    id: 'hespori',
    label: 'Hespori (every 3 days)',
    category: 'evening',
    detail: 'Farming Guild. Free 12.6k Farming XP. Takes ~2 mins. Never skip this.',
    xpGain: '12,600 Farming XP',
  },
  {
    id: 'battlestaves',
    label: 'Daily battlestaves (Zaff)',
    category: 'evening',
    detail: '35–50 staves from Zaff in Varrock (requires completing a certain stage of Varrock diary). Instant profit.',
    xpGain: 'Profit ~15k GP/day',
  },
  {
    id: 'pure-essence',
    label: 'Pure Essence (Wizard Cromperty)',
    category: 'evening',
    detail: '44 free pure essence from Wizard Cromperty in East Ardougne (Rune Mysteries quest). Tiny but free.',
    xpGain: 'Free essence',
  },
  // Weekly
  {
    id: 'kingdom',
    label: 'Kingdom of Miscellania',
    category: 'weekly',
    detail: 'Set workers to mahogany + coal OR mahogany + birds. Log in every 7 days to collect and refill coffers. Keep approval at 100%.',
    xpGain: 'Passive GP + resources',
  },
  {
    id: 'sand-buckets',
    label: "Bert's sand buckets (Yanille)",
    category: 'weekly',
    detail: 'Collect 84 free buckets of sand from Bert in Yanille once per day (after Hand in the Sand quest).',
    xpGain: 'Free crafting material',
  },
  {
    id: 'nmz-reset',
    label: 'NMZ rumble custom reset',
    category: 'weekly',
    detail: 'Check NMZ Dharok setup: restock super combats, overloads, absorptions. Reset customizable rumble with your 5 easy bosses.',
    xpGain: 'Prep for AFK sessions',
  },
]

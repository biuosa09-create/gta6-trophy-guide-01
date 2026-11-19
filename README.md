# Leonida Trophy Guide — Grand Theft Auto VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/biuosa09-create/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/biuosa09-create/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for make.fun bounty [`gta6-trophy-guide-01`](https://make.fun/bounty/gta6-trophy-guide-01):
an offline web app that is the best guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI.

New to make.fun? Sign up with my referral link: https://make.fun/r/shw861zs (code `shw861zs`).

## What it does

- **The official list** — all 55 trophies with their official name, description
  and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 27 visible, 28 hidden),
  in `app/data/trophies.json`.
- **Checklist tracker** — tick trophies off; progress is saved in the browser
  (localStorage), with export to and import from a JSON file, plus reset.
- **Search and filters** — by text, grade, kind (story, side strand, robbery,
  activity, collectible, exploration, combat, misc, 100% completion), status
  (earned / not earned / missable only).
- **Spoiler setting** — hides the 28 hidden (story) trophies' names, descriptions
  and guides until you earn them; one click shows them.
- **A guide for every trophy** — in our own words: what to do, where, how, and
  when it can be missed, each with its sources listed.
- **Platinum roadmap** — six phases from save set-up to 100% completion, about
  200 hours, with the trophies each phase covers.
- **Missable flags** — the one reported missable trophy (Positive Mental
  Attitude) and the time-sensitive Yago race, with the save strategy for a
  game with no mission replay and no New Game Plus.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

It is plain static files: open `app/index.html` from any static server, or
from the hosted page. It makes no network requests. To hand it in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Rockstar has not published an official trophy list. Names, descriptions and
grades are the PlayStation list as reported on 18 November 2026 by Exophase
and covered by Push Square, cross-checked on GTABase, PowerPyx, PSNProfiles
and TrueAchievements. How-to details come from those guides and from Output
Lag's trophy list, rewritten here in our own words — nothing is copied from
another guide. Each trophy's entry in `app/data/trophies.json` lists the
sources it draws on.

## License

MIT — see `LICENSE`. This is an unofficial fan guide, not affiliated with
Rockstar Games.

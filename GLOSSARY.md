# LunarCal

A Chinese lunar calendar app: daily almanac (宜忌, 干支, 通書), a monthly calendar, an auspicious-date finder, and a personal page that compares days against the user's own birth chart.

## Language

**Birth Profile** (個人資料):
The user's birth date, their birth time if known, and optionally their gender, from which their 八字 (Bazi) chart is derived. There is at most one.
_Avoid_: Profile (alone), account, user

**Saved Date** (已存日子):
A solar date the user has labelled and kept, shown with how well it suits their Birth Profile. A Saved Date can outlive the Birth Profile: clearing the profile lets the user choose to keep or remove their Saved Dates.
_Avoid_: Bookmark, favourite, saved day

### Almanac

**Activity** (宜忌事項):
A named undertaking, such as 嫁娶 or 開市, that a day's 宜/忌 favours or advises against, and that the 擇吉 finder searches for.
_Avoid_: Event, task

**Yi / Ji** (宜/忌):
The Activities a day is said to favour (宜) and advise against (忌), set by the day's 干支 together with its Month Pillar.
_Avoid_: Do's and don'ts, good/bad activities

**Month Pillar** (月柱):
The 干支 of the month a day falls in. It changes at each Sectional Term, not on the 1st of the Gregorian month or the lunar month.
_Avoid_: Monthly 干支, lunar month 干支

**Sectional Term** (節):
One of the 12 solar terms (立春, 驚蟄, 清明 … 小寒) that begin a new Month Pillar. The other 12 solar terms (中氣) don't change it.
_Avoid_: Solar term (when only these 12 are meant)

**Lunar Date** (農曆日期):
A day's lunar month and day, such as 閏二月十一 or 臘月初八, without the year. It is written in traditional characters, like the rest of the app.
_Avoid_: Chinese date, lunar day (when the month is meant too)

**Leap Month** (閏月):
An extra lunar month inserted in some years. It is labelled 閏 followed by the number of the month it repeats (閏二 follows 二月), and it does not change the Month Pillar.
_Avoid_: Intercalary month

**Clash Animal** (沖):
The zodiac animal whose earthly branch is opposite the day's branch. People born in that animal's year are advised to be cautious that day, and the 擇吉 finder leaves such days out for them.
_Avoid_: Clash zodiac, 冲 (simplified)

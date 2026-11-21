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

**Yi / Ji** (宜/忌):
The activities a day is said to favour (宜) and advise against (忌), set by the day's 干支 together with its Month Pillar.
_Avoid_: Do's and don'ts, good/bad activities

**Month Pillar** (月柱):
The 干支 of the month a day falls in. It changes at each Sectional Term, not on the 1st of the Gregorian month or the lunar month.
_Avoid_: Monthly 干支, lunar month 干支

**Sectional Term** (節):
One of the 12 solar terms (立春, 驚蟄, 清明 … 小寒) that begin a new Month Pillar. The other 12 solar terms (中氣) don't change it.
_Avoid_: Solar term (when only these 12 are meant)

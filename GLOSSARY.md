# LunarCal

A Chinese lunar calendar app: daily almanac (宜忌, 干支, 通書), a monthly calendar, an auspicious-date finder, and a personal page that compares days against the user's own birth chart.

## Language

**Birth Profile** (個人資料):
The user's birth date, their birth time if known, and optionally their gender, from which their 八字 (Bazi) chart is derived. There is at most one.
_Avoid_: Profile (alone), account, user

**Saved Date** (已存日子):
A solar date the user has labelled and kept, shown with how well it suits their Birth Profile. A Saved Date can outlive the Birth Profile: clearing the profile lets the user choose to keep or remove their Saved Dates.
_Avoid_: Bookmark, favourite, saved day

**Activity** (宜忌事項):
A named undertaking, such as 嫁娶 or 開市, that a day's 宜/忌 favours or advises against, and that the 擇吉 finder searches for.
_Avoid_: Event, task

**Lunar Date** (農曆日期):
A day's lunar month and day, such as 閏二月十一 or 臘月初八, without the year. It is written in traditional characters, like the rest of the app.
_Avoid_: Chinese date, lunar day (when the month is meant too)

**Leap Month** (閏月):
An extra lunar month inserted in some years. It is labelled 閏 followed by the number of the month it repeats (閏二 follows 二月), and it does not change the Month Pillar.
_Avoid_: Intercalary month

import Foundation

struct LunarDayInfo: Codable {
    let solarYear: Int
    let solarMonth: Int
    let solarDay: Int
    let weekdayCn: String

    let lunarMonthCn: String
    let lunarDayCn: String

    let yearGanzhi: String
    let monthGanzhi: String
    let dayGanzhi: String

    let clashAnimal: String
    let clashEmoji: String
    let clashBranch: String
    let sha: String
    let nayin: String

    let nextJieqi: String?
    let nextJieqiDate: String?

    let yi: [String]
    let ji: [String]
}

extension LunarDayInfo {
    /// False outside the solar-term table's range, where 宜/忌 are unknown.
    var hasYiJi: Bool { !yi.isEmpty || !ji.isEmpty }
}

struct LunarCalculator {

    // MARK: - Shared data (App Group)
    //
    // The app writes the real lunar-javascript data (the same engine the app UI
    // uses) into the shared App Group on launch / resume. We prefer that here so
    // the widget and the app never disagree. The local computation below is only
    // a fallback for the window before the app is first opened.

    private static let appGroup = "group.com.raeyean.LunarCal"
    private static let dataKey = "widgetData"

    static func shared(year: Int, month: Int, day: Int) -> LunarDayInfo? {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let json = defaults.string(forKey: dataKey),
            let data = json.data(using: .utf8),
            let map = try? JSONDecoder().decode([String: LunarDayInfo].self, from: data)
        else { return nil }
        let key = String(format: "%04d-%02d-%02d", year, month, day)
        return map[key]
    }

    // MARK: - Constants

    private static let heavenlyStems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
    private static let earthlyBranches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
    private static let zodiacAnimals = ["鼠","牛","虎","兔","龍","蛇","馬","羊","猴","雞","狗","豬"]
    private static let zodiacEmojis = ["🐀","🐂","🐅","🐇","🐉","🐍","🐴","🐏","🐒","🐓","🐕","🐖"]

    private static let lunarMonthNames = ["正","二","三","四","五","六","七","八","九","十","冬","臘"]
    private static let lunarDayNames = [
        "初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
        "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
        "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"
    ]

    private static let weekdayNames = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]

    // Nayin (納音) table - 30 pairs for the 60 Jiazi cycle
    private static let nayinTable = [
        "海中金","海中金","爐中火","爐中火","大林木","大林木",
        "路旁土","路旁土","劍鋒金","劍鋒金","山頭火","山頭火",
        "澗下水","澗下水","城頭土","城頭土","白蠟金","白蠟金",
        "楊柳木","楊柳木","泉中水","泉中水","屋上土","屋上土",
        "霹靂火","霹靂火","松柏木","松柏木","長流水","長流水",
        "砂石金","砂石金","山下火","山下火","平地木","平地木",
        "壁上土","壁上土","金箔金","金箔金","覆燈火","覆燈火",
        "天河水","天河水","大驛土","大驛土","釵釧金","釵釧金",
        "桑柘木","桑柘木","大溪水","大溪水","沙中土","沙中土",
        "天上火","天上火","石榴木","石榴木","大海水","大海水"
    ]

    // Sha directions based on day Earthly Branch
    private static let shaDirections: [String: String] = [
        "子":"南","丑":"東","寅":"北","卯":"西",
        "辰":"南","巳":"東","午":"北","未":"西",
        "申":"南","酉":"東","戌":"北","亥":"西"
    ]

    // Solar-term dates (AlmanacData.jieqiDates) and the 宜/忌 rules
    // (AlmanacData.dayYiJi) are generated from lunar-javascript by
    // scripts/verify-swift-almanac/generate-data.js (issue #41, ADR 0001).

    // The 12 sectional terms (節) that start each Ganzhi month, mapped to the
    // month branch and its 0-based index in the 寅-first month order.
    private static let sectionalTerms: [String: (branch: String, idx: Int)] = [
        "立春": ("寅", 0), "驚蟄": ("卯", 1), "清明": ("辰", 2), "立夏": ("巳", 3),
        "芒種": ("午", 4), "小暑": ("未", 5), "立秋": ("申", 6), "白露": ("酉", 7),
        "寒露": ("戌", 8), "立冬": ("亥", 9), "大雪": ("子", 10), "小寒": ("丑", 11)
    ]

    // MARK: - Calculation Methods

    /// Julian Day Number for a given date
    private static func julianDay(year: Int, month: Int, day: Int) -> Int {
        let a = (14 - month) / 12
        let y = year + 4800 - a
        let m = month + 12 * a - 3
        return day + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045
    }

    /// Get day Ganzhi index (0-59) for a solar date
    private static func dayGanzhiIndex(year: Int, month: Int, day: Int) -> Int {
        let jd = julianDay(year: year, month: month, day: day)
        return ((jd - 2415020 + 9) % 60 + 60) % 60
    }

    /// Get year Ganzhi index
    private static func yearGanzhiIndex(year: Int) -> Int {
        return ((year - 4) % 60 + 60) % 60
    }

    /// 五虎遁 starting stem of the 寅 month for a given year-stem index.
    private static func startStem(forYearStem yearStemIdx: Int) -> Int {
        switch yearStemIdx {
        case 0, 5: return 2  // 甲己 -> 丙
        case 1, 6: return 4  // 乙庚 -> 戊
        case 2, 7: return 6  // 丙辛 -> 庚
        case 3, 8: return 8  // 丁壬 -> 壬
        case 4, 9: return 0  // 戊癸 -> 甲
        default: return 0
        }
    }

    /// 立春 (month, day) for a year, if known.
    private static func lichun(_ year: Int) -> (Int, Int)? {
        guard let terms = AlmanacData.jieqiDates[year] else { return nil }
        for (m, d, name) in terms where name == "立春" { return (m, d) }
        return nil
    }

    /// Month Pillar (月柱) from the most recent Sectional Term (節) on or before
    /// the date — NOT the Gregorian month. The year stem for 五虎遁 flips at 立春.
    /// Nil outside the solar-term table's range.
    private static func monthPillar(year: Int, month: Int, day: Int) -> String? {
        var best: (y: Int, m: Int, d: Int, name: String)?
        for y in [year - 1, year] {
            guard let terms = AlmanacData.jieqiDates[y] else { continue }
            for (m, d, name) in terms where sectionalTerms[name] != nil {
                let onOrBefore = y < year || m < month || (m == month && d <= day)
                guard onOrBefore else { continue }
                if let b = best {
                    if (y, m, d) > (b.y, b.m, b.d) { best = (y, m, d, name) }
                } else {
                    best = (y, m, d, name)
                }
            }
        }

        // The latest term must come from this year or last December's 大雪,
        // which needs both years in the table.
        guard AlmanacData.jieqiDates[year] != nil, AlmanacData.jieqiDates[year - 1] != nil,
              let term = best, let info = sectionalTerms[term.name] else { return nil }

        var stemYear = year
        if let (lm, ld) = lichun(year), month < lm || (month == lm && day < ld) {
            stemYear = year - 1
        }
        let yearStemIdx = yearGanzhiIndex(year: stemYear) % 10
        let stemIdx = (startStem(forYearStem: yearStemIdx) + info.idx) % 10
        return heavenlyStems[stemIdx] + info.branch
    }

    /// Rough month 干支 from the Gregorian month, for display only when the
    /// date is outside the solar-term table.
    private static func approximateMonthGanzhi(year: Int, month: Int) -> String {
        let yIdx = yearGanzhiIndex(year: year) % 10
        let stemIdx = (startStem(forYearStem: yIdx) + month - 1) % 10
        return heavenlyStems[stemIdx] + earthlyBranches[(month + 1) % 12]
    }

    // MARK: - 宜/忌 (port of lunar-javascript LunarUtil.getDayYi / getDayJi)

    private static let dayYiJiBytes: [UInt8] = Array(AlmanacData.dayYiJi.utf8)
    private static let hexDigits: [UInt8] = Array("0123456789ABCDEF".utf8)

    /// Index (0-59) of a 干支 in the sexagenary cycle.
    private static func jiaZiIndex(_ ganzhi: String) -> Int? {
        let chars = Array(ganzhi)
        guard chars.count == 2,
              let s = heavenlyStems.firstIndex(of: String(chars[0])),
              let b = earthlyBranches.firstIndex(of: String(chars[1])) else { return nil }
        return (0..<60).first { $0 % 10 == s && $0 % 12 == b }
    }

    private static func hexCode(_ n: Int) -> (UInt8, UInt8) {
        (hexDigits[n / 16], hexDigits[n % 16])
    }

    private static func hexValue(_ hi: UInt8, _ lo: UInt8) -> Int? {
        guard let h = hexDigits.firstIndex(of: hi), let l = hexDigits.firstIndex(of: lo) else { return nil }
        return h * 16 + l
    }

    /// 宜 and 忌 for a day, the same as lunar-javascript's
    /// `Lunar.getDayYi()` / `getDayJi()` (default sect: day-level Month Pillar).
    ///
    /// DAY_YI_JI is a run of records `DD=MMMM…:YYYY…,JJJJ…`: the day's 干支
    /// index, the Month Pillar indexes the record applies to, then the 宜 and
    /// 忌 activity codes, all as two-digit hex. The first record for the day
    /// whose months include this Month Pillar wins; no match gives `无`.
    static func yiJi(monthPillar: String, dayGanzhi: String) -> (yi: [String], ji: [String]) {
        guard let dayIdx = jiaZiIndex(dayGanzhi), let monthIdx = jiaZiIndex(monthPillar) else {
            return ([], [])
        }
        let bytes = dayYiJiBytes
        let (d0, d1) = hexCode(dayIdx)
        let (m0, m1) = hexCode(monthIdx)
        let eq = UInt8(ascii: "="), colon = UInt8(ascii: ":"), comma = UInt8(ascii: ",")

        func decode(_ range: Range<Int>) -> [String] {
            var out: [String] = []
            var i = range.lowerBound
            while i + 1 < range.upperBound {
                if let v = hexValue(bytes[i], bytes[i + 1]), v < AlmanacData.yiJi.count {
                    out.append(AlmanacData.yiJi[v])
                }
                i += 2
            }
            return out
        }

        var pos = 0
        while pos + 2 < bytes.count {
            // Find the next "DD=" record for this day.
            guard bytes[pos] == d0, bytes[pos + 1] == d1, bytes[pos + 2] == eq else {
                pos += 1
                continue
            }
            let start = pos + 3
            // The record ends two characters before the next "=" (the next key).
            var end = bytes.count
            if let nextEq = bytes[start...].firstIndex(of: eq) { end = nextEq - 2 }
            guard let colonIdx = bytes[start..<end].firstIndex(of: colon),
                  let commaIdx = bytes[colonIdx..<end].firstIndex(of: comma) else {
                pos = start
                continue
            }
            var matched = false
            var i = start
            while i + 1 < colonIdx {
                if bytes[i] == m0 && bytes[i + 1] == m1 { matched = true; break }
                i += 2
            }
            if matched {
                let yi = decode((colonIdx + 1)..<commaIdx)
                let ji = decode((commaIdx + 1)..<end)
                return (yi.isEmpty ? [AlmanacData.none] : yi, ji.isEmpty ? [AlmanacData.none] : ji)
            }
            pos = start
        }
        return ([AlmanacData.none], [AlmanacData.none])
    }

    private static func ganzhiString(index: Int) -> String {
        let stemIdx = index % 10
        let branchIdx = index % 12
        return heavenlyStems[stemIdx] + earthlyBranches[branchIdx]
    }

    /// Get lunar date components using iOS Chinese Calendar
    private static func lunarComponents(from date: Date) -> DateComponents {
        let cal = Calendar(identifier: .chinese)
        return cal.dateComponents([.year, .month, .day, .weekday], from: date)
    }

    /// Build a Date from year/month/day
    private static func makeDate(year: Int, month: Int, day: Int) -> Date {
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = day
        comps.hour = 12
        let cal = Calendar(identifier: .gregorian)
        return cal.date(from: comps)!
    }

    /// Find the next Jieqi from a given date
    private static func findNextJieqi(year: Int, month: Int, day: Int) -> (name: String, dateStr: String)? {
        for y in [year, year + 1] {
            guard let terms = AlmanacData.jieqiDates[y] else { continue }
            for (m, d, name) in terms {
                if y > year || m > month || (m == month && d > day) {
                    return (name, "\(m)月\(d)日")
                }
            }
        }
        return nil
    }

    /// Check if a given date is a Jieqi
    private static func jieqiOnDate(year: Int, month: Int, day: Int) -> String? {
        guard let terms = AlmanacData.jieqiDates[year] else { return nil }
        for (m, d, name) in terms {
            if m == month && d == day { return name }
        }
        return nil
    }

    // MARK: - Public API

    /// Prefer real data shared by the app; fall back to local computation.
    static func calculate(year: Int, month: Int, day: Int) -> LunarDayInfo {
        if let sharedInfo = shared(year: year, month: month, day: day) {
            return sharedInfo
        }
        return computeFallback(year: year, month: month, day: day)
    }

    private static func computeFallback(year: Int, month: Int, day: Int) -> LunarDayInfo {
        let date = makeDate(year: year, month: month, day: day)
        let lunarComps = lunarComponents(from: date)
        let gregorianCal = Calendar(identifier: .gregorian)
        let weekday = gregorianCal.component(.weekday, from: date) - 1 // 0=Sunday

        // Lunar month/day names
        let lunarMonth = (lunarComps.month ?? 1) - 1
        let lunarDay = (lunarComps.day ?? 1) - 1
        // TEMPORARY clamp: Apple's Chinese calendar returns day 0 for some
        // dates (e.g. 2057-09-28), which indexed -1 and crashed. The lunar date
        // itself can still disagree with lunar-javascript there; see the
        // follow-up issue.
        let monthCn = lunarMonthNames[max(0, min(lunarMonth, 11))]
        let dayCn = lunarDayNames[max(0, min(lunarDay, 29))]

        // Year pillar flips at lunar new year (matching the app's
        // getYearInGanZhi), so use the Chinese calendar's sexagenary year
        // (1-60, year 1 = 甲子) instead of the Gregorian year.
        let yearGZ: String
        if let chineseYear = lunarComps.year, chineseYear >= 1 {
            yearGZ = ganzhiString(index: (chineseYear - 1) % 60)
        } else {
            yearGZ = ganzhiString(index: yearGanzhiIndex(year: year))
        }
        let pillar = monthPillar(year: year, month: month, day: day)
        let monthGZ = pillar ?? approximateMonthGanzhi(year: year, month: month)

        // Day Ganzhi
        let dayIdx = dayGanzhiIndex(year: year, month: month, day: day)
        let dayGZ = ganzhiString(index: dayIdx)
        let dayBranchIdx = dayIdx % 12

        // Clash: branch 6 positions away
        let clashBranchIdx = (dayBranchIdx + 6) % 12
        let clashAnimalName = zodiacAnimals[clashBranchIdx]
        let clashEmoji = zodiacEmojis[clashBranchIdx]
        let clashBranch = earthlyBranches[clashBranchIdx]

        // Sha direction
        let sha = shaDirections[earthlyBranches[dayBranchIdx]] ?? "南"

        // Nayin
        let nayinStr = nayinTable[dayIdx]

        // Jieqi
        let jieqiToday = jieqiOnDate(year: year, month: month, day: day)
        let nextJieqi = findNextJieqi(year: year, month: month, day: day)

        // Yi/Ji: only when the Month Pillar is known (inside the solar-term
        // table); otherwise empty so the UI hides the rows rather than guess.
        let (yi, ji) = pillar.map { yiJi(monthPillar: $0, dayGanzhi: dayGZ) } ?? ([], [])

        return LunarDayInfo(
            solarYear: year,
            solarMonth: month,
            solarDay: day,
            weekdayCn: weekdayNames[weekday],
            lunarMonthCn: monthCn,
            lunarDayCn: dayCn,
            yearGanzhi: yearGZ,
            monthGanzhi: monthGZ,
            dayGanzhi: dayGZ,
            clashAnimal: clashAnimalName,
            clashEmoji: clashEmoji,
            clashBranch: clashBranch,
            sha: sha,
            nayin: nayinStr,
            nextJieqi: jieqiToday ?? nextJieqi?.name,
            nextJieqiDate: jieqiToday != nil ? nil : nextJieqi?.dateStr,
            yi: yi,
            ji: ji
        )
    }
}

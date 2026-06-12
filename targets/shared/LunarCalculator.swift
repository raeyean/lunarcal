import Foundation

struct LunarDayInfo {
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

struct LunarCalculator {

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

    // Yi/Ji activities based on day Heavenly Stem index
    private static let yiByDayStem: [[String]] = [
        ["祭祀","祈福","求嗣","開光","出行","納采"],      // 甲
        ["嫁娶","納采","祭祀","祈福","出行","動土"],      // 乙
        ["祭祀","修造","動土","開市","交易","納財"],      // 丙
        ["祈福","求嗣","齋醮","開光","入學","納采"],      // 丁
        ["修造","動土","豎柱","開市","納財","立券"],      // 戊
        ["祭祀","治病","破屋","壞垣","餘事勿取"],        // 己
        ["嫁娶","開市","交易","立券","納財","掛匾"],      // 庚
        ["祭祀","祈福","安葬","啟攅","除服","成服"],      // 辛
        ["出行","納采","嫁娶","祭祀","祈福","動土"],      // 壬
        ["塞穴","結網","取漁","畋獵","餘事勿取"]          // 癸
    ]

    private static let jiByDayStem: [[String]] = [
        ["動土","破土","安葬","開倉","修造","掘井"],      // 甲
        ["開倉","造屋","安葬","行喪","詞訟","修造"],      // 乙
        ["嫁娶","安葬","出行","詞訟","安門","移徙"],      // 丙
        ["動土","開市","交易","安葬","破土","修造"],      // 丁
        ["嫁娶","出行","安葬","祈福","探病","入宅"],      // 戊
        ["諸事不宜"],                                    // 己
        ["動土","安葬","修造","破土","行喪","開光"],      // 庚
        ["嫁娶","開市","動土","交易","入宅","出行"],      // 辛
        ["安葬","破土","修造","開倉","造屋","移徙"],      // 壬
        ["嫁娶","安門","移徙","開市","入宅","安葬"]       // 癸
    ]

    // MARK: - Jieqi dates for 2024-2030
    // Format: [year: [(month, day, name)]]
    private static let jieqiDates: [Int: [(Int, Int, String)]] = [
        2024: [
            (1,6,"小寒"),(1,20,"大寒"),(2,4,"立春"),(2,19,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,4,"清明"),(4,19,"穀雨"),
            (5,5,"立夏"),(5,20,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,6,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,22,"處暑"),
            (9,7,"白露"),(9,22,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,6,"大雪"),(12,21,"冬至")
        ],
        2025: [
            (1,5,"小寒"),(1,20,"大寒"),(2,3,"立春"),(2,18,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,4,"清明"),(4,20,"穀雨"),
            (5,5,"立夏"),(5,21,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,7,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,23,"處暑"),
            (9,7,"白露"),(9,22,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,7,"大雪"),(12,21,"冬至")
        ],
        2026: [
            (1,5,"小寒"),(1,20,"大寒"),(2,4,"立春"),(2,18,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,5,"清明"),(4,20,"穀雨"),
            (5,5,"立夏"),(5,21,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,7,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,23,"處暑"),
            (9,7,"白露"),(9,23,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,7,"大雪"),(12,22,"冬至")
        ],
        2027: [
            (1,5,"小寒"),(1,20,"大寒"),(2,4,"立春"),(2,18,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,5,"清明"),(4,20,"穀雨"),
            (5,5,"立夏"),(5,21,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,7,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,23,"處暑"),
            (9,7,"白露"),(9,23,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,7,"大雪"),(12,22,"冬至")
        ],
        2028: [
            (1,6,"小寒"),(1,20,"大寒"),(2,4,"立春"),(2,19,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,4,"清明"),(4,19,"穀雨"),
            (5,5,"立夏"),(5,20,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,6,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,22,"處暑"),
            (9,7,"白露"),(9,22,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,6,"大雪"),(12,21,"冬至")
        ],
        2029: [
            (1,5,"小寒"),(1,20,"大寒"),(2,3,"立春"),(2,18,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,4,"清明"),(4,20,"穀雨"),
            (5,5,"立夏"),(5,21,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,7,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,23,"處暑"),
            (9,7,"白露"),(9,22,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,7,"大雪"),(12,21,"冬至")
        ],
        2030: [
            (1,5,"小寒"),(1,20,"大寒"),(2,4,"立春"),(2,18,"雨水"),
            (3,5,"驚蟄"),(3,20,"春分"),(4,5,"清明"),(4,20,"穀雨"),
            (5,5,"立夏"),(5,21,"小滿"),(6,5,"芒種"),(6,21,"夏至"),
            (7,7,"小暑"),(7,22,"大暑"),(8,7,"立秋"),(8,23,"處暑"),
            (9,7,"白露"),(9,23,"秋分"),(10,8,"寒露"),(10,23,"霜降"),
            (11,7,"立冬"),(11,22,"小雪"),(12,7,"大雪"),(12,22,"冬至")
        ]
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
        // Jan 1, 1900 is 甲子 (index 0) at JD 2415021
        // Actually JD for Jan 1, 1900 = 2415021, and that day is 甲戌 (index 10)
        // We need offset: (jd - 2415020 + 9) % 60
        return ((jd - 2415020 + 9) % 60 + 60) % 60
    }

    /// Get year Ganzhi index
    private static func yearGanzhiIndex(year: Int) -> Int {
        return ((year - 4) % 60 + 60) % 60
    }

    /// Approximate month Ganzhi index
    /// Month Ganzhi follows: Year Stem determines the starting stem for months
    /// Rule: 甲己年起丙寅月, 乙庚年起戊寅月, 丙辛年起庚寅月, 丁壬年起壬寅月, 戊癸年起甲寅月
    private static func monthGanzhiIndex(year: Int, month: Int) -> Int {
        let yearStemIdx = yearGanzhiIndex(year: year) % 10
        let startStem: Int
        switch yearStemIdx {
        case 0, 5: startStem = 2  // 甲己 -> 丙
        case 1, 6: startStem = 4  // 乙庚 -> 戊
        case 2, 7: startStem = 6  // 丙辛 -> 庚
        case 3, 8: startStem = 8  // 丁壬 -> 壬
        case 4, 9: startStem = 0  // 戊癸 -> 甲
        default: startStem = 0
        }
        // Month 1 (寅月) = index 2 in branches, each month advances by 1
        let monthOffset = month - 1 // 0-based
        let stemIdx = (startStem + monthOffset) % 10
        let branchIdx = (2 + monthOffset) % 12
        return stemIdx * 12 + branchIdx // Not quite right, need proper Jiazi index
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
        // Check current year and next year
        for y in [year, year + 1] {
            guard let terms = jieqiDates[y] else { continue }
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
        guard let terms = jieqiDates[year] else { return nil }
        for (m, d, name) in terms {
            if m == month && d == day { return name }
        }
        return nil
    }

    // MARK: - Public API

    static func calculate(year: Int, month: Int, day: Int) -> LunarDayInfo {
        let date = makeDate(year: year, month: month, day: day)
        let lunarComps = lunarComponents(from: date)
        let gregorianCal = Calendar(identifier: .gregorian)
        let weekday = gregorianCal.component(.weekday, from: date) - 1 // 0=Sunday

        // Lunar month/day names
        let lunarMonth = (lunarComps.month ?? 1) - 1
        let lunarDay = (lunarComps.day ?? 1) - 1
        let monthCn = lunarMonthNames[min(lunarMonth, 11)]
        let dayCn = lunarDayNames[min(lunarDay, 29)]

        // Ganzhi
        let yearIdx = yearGanzhiIndex(year: year)
        let yearGZ = ganzhiString(index: yearIdx)

        // Month Ganzhi
        let yearStemIdx = yearIdx % 10
        let startStem: Int
        switch yearStemIdx {
        case 0, 5: startStem = 2
        case 1, 6: startStem = 4
        case 2, 7: startStem = 6
        case 3, 8: startStem = 8
        case 4, 9: startStem = 0
        default: startStem = 0
        }
        let monthStemIdx = (startStem + month - 1) % 10
        let monthBranchIdx = (month + 1) % 12  // month 1 -> 寅(2)
        let monthGZ = heavenlyStems[monthStemIdx] + earthlyBranches[monthBranchIdx]

        // Day Ganzhi
        let dayIdx = dayGanzhiIndex(year: year, month: month, day: day)
        let dayGZ = ganzhiString(index: dayIdx)
        let dayStemIdx = dayIdx % 10
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

        // Yi/Ji
        let yi = yiByDayStem[dayStemIdx]
        let ji = jiByDayStem[dayStemIdx]

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

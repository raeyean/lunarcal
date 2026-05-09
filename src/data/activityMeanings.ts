/** Brief explanations for activity terms used in 黃曆 宜/忌 listings. */
export interface ActivityMeaning {
  name: string;
  meaning: string;
}

export const ACTIVITY_MEANINGS: ActivityMeaning[] = [
  { name: '祭祀', meaning: '祭拜祖先、神明，獻供祈安。' },
  { name: '祈福', meaning: '請僧道設醮，向神明祈求福祿平安。' },
  { name: '求嗣', meaning: '向神明祈求子嗣。' },
  { name: '開光', meaning: '寺廟神像、佛具或新製器物擇吉開光點眼。' },
  { name: '塑繪', meaning: '雕塑、繪製神像或佛像。' },
  { name: '齋醮', meaning: '道教祈禳法事，建壇設齋祭神。' },
  { name: '訂盟', meaning: '訂立婚約，又稱小聘、文定。' },
  { name: '納采', meaning: '古婚禮六禮之一，男方備禮向女方提親。' },
  { name: '嫁娶', meaning: '結婚成親，舉辦婚禮。' },
  { name: '出行', meaning: '外出遠行、旅遊或差旅。' },
  { name: '移徙', meaning: '搬家、遷居至新住所。' },
  { name: '入宅', meaning: '搬進新居入住。' },
  { name: '安床', meaning: '安置睡床或更換床位。' },
  { name: '修造', meaning: '修建、改建或裝修房屋。' },
  { name: '動土', meaning: '建築工程破土開工。' },
  { name: '起基', meaning: '房屋奠基、立基築礎。' },
  { name: '上樑', meaning: '架設房屋主樑。' },
  { name: '安門', meaning: '安置或更換大門門框、門扇。' },
  { name: '安葬', meaning: '舉行喪葬下葬儀式。' },
  { name: '啟攢', meaning: '啟開棺木、改葬遷墳。' },
  { name: '立碑', meaning: '豎立墓碑或紀念碑。' },
  { name: '修墳', meaning: '整修、維護墳墓。' },
  { name: '開市', meaning: '商家開業營業、新店開張。' },
  { name: '立券', meaning: '訂立契約、簽訂合同。' },
  { name: '交易', meaning: '商業買賣、貿易往來。' },
  { name: '納財', meaning: '收進財物、進貨進帳。' },
  { name: '出貨財', meaning: '出售貨品、放出財物。' },
  { name: '開渠', meaning: '開挖溝渠、引水築堤。' },
  { name: '穿井', meaning: '鑿井取水。' },
  { name: '栽種', meaning: '種植作物、花草樹木。' },
  { name: '牧養', meaning: '放牧、飼養家畜。' },
  { name: '納畜', meaning: '購買、收養家畜或寵物。' },
  { name: '解除', meaning: '清掃居家、消除穢氣或解災。' },
  { name: '沐浴', meaning: '齋戒洗浴淨身。' },
  { name: '剃頭', meaning: '理髮、剃除胎髮。' },
  { name: '整手足甲', meaning: '修剪手指甲、腳趾甲。' },
  { name: '求醫', meaning: '看病求診、問藥治病。' },
  { name: '治病', meaning: '接受治療、動手術或療程。' },
  { name: '訴訟', meaning: '提起訴訟、上法庭打官司。' },
  { name: '會親友', meaning: '探訪親朋好友、家庭聚會。' },
  { name: '進人口', meaning: '收養子女、招募新員工。' },
  { name: '安香', meaning: '安置神位、神龕或香爐。' },
  { name: '上官', meaning: '官員就任新職。' },
  { name: '赴任', meaning: '走馬上任、報到任職。' },
  { name: '經絡', meaning: '安裝織機、整理紡織器具。' },
  { name: '醞釀', meaning: '釀造酒、醋、醬料等。' },
  { name: '結網', meaning: '編織漁網、捕獸網具。' },
  { name: '取漁', meaning: '捕撈魚蝦、下網捕魚。' },
  { name: '出火', meaning: '移動神位香火至他處。' },
  { name: '入學', meaning: '拜師學藝、開學上學。' },
  { name: '冠笄', meaning: '行成年禮，男冠女笄。' },
  { name: '開倉', meaning: '開啟倉庫、出納倉儲。' },
  { name: '掃舍', meaning: '清掃居家、除舊布新。' },
  { name: '拆卸', meaning: '拆除房屋、設施或結構。' },
  { name: '作灶', meaning: '安設爐灶或廚房改造。' },
  { name: '探病', meaning: '探視病人。' },
  { name: '補垣塞穴', meaning: '修補牆垣、堵塞洞穴。' },
  { name: '平治道塗', meaning: '修整、鋪平道路。' },
  { name: '蓋屋', meaning: '搭建房屋、蓋頂封簷。' },
  { name: '掛匾', meaning: '懸掛匾額，慶賀店鋪、廟宇、家宅落成或榮譽事跡。' },
  { name: '塞穴', meaning: '堵塞洞穴、孔隙，防漏防蟲。' },
  { name: '伐木', meaning: '砍伐樹木，取材或清地。' },
  { name: '詞訟', meaning: '提起訴訟、上法庭打官司。' },
  { name: '破土', meaning: '墓地破土動工，葬禮前儀式（與陽宅動土不同）。' },
  { name: '餘事勿取', meaning: '除推薦事項外，其他事務皆不宜進行。' },
  { name: '入殮', meaning: '將遺體放入棺木。' },
  { name: '移柩', meaning: '移動靈柩、遷移棺木。' },
  { name: '除服', meaning: '守孝期滿，除去喪服。' },
  { name: '成服', meaning: '喪事開始穿著喪服。' },
  { name: '理髮', meaning: '修剪頭髮、剃除胎髮。' },
  { name: '造畜稠', meaning: '修建牲畜棚舍。' },
  { name: '安機械', meaning: '安裝、啟用機械設備。' },
  { name: '豎柱', meaning: '立起屋柱、起立樑柱。' },
  { name: '開池', meaning: '開挖池塘、水塘。' },
  { name: '壞垣', meaning: '拆除舊牆垣。' },
  { name: '破屋', meaning: '拆除舊屋。' },
  { name: '謝土', meaning: '工程完工後祭祀土地神。' },
  { name: '畋獵', meaning: '打獵、田獵。' },
  { name: '裁衣', meaning: '裁剪、縫製衣物。' },
  { name: '捕捉', meaning: '捕捉禽獸或害蟲。' },
  { name: '補垣', meaning: '修補牆垣。' },
  { name: '造車器', meaning: '製造車輛、器具。' },
  { name: '修飾垣牆', meaning: '修整、粉刷牆面。' },
  { name: '定磉', meaning: '安置柱腳石。' },
  { name: '掘井', meaning: '開挖水井。' },
  { name: '教牛馬', meaning: '訓練牛、馬。' },
  { name: '放水', meaning: '開閘放水、灌溉田地。' },
  { name: '造倉', meaning: '建造倉庫。' },
  { name: '作樑', meaning: '架設房屋樑木。' },
  { name: '置產', meaning: '購置房產田產。' },
  { name: '開廁', meaning: '興建廁所、化糞設施。' },
  { name: '合帳', meaning: '縫製、安掛帳幕或蚊帳。' },
  { name: '開生墳', meaning: '生前預修墓地。' },
  { name: '架馬', meaning: '架設馬鞍或馬廄。' },
  { name: '築堤', meaning: '修築堤防。' },
  { name: '安碓磑', meaning: '安裝碓臼、磨石。' },
  { name: '合壽木', meaning: '製作壽棺。' },
  { name: '斷蟻', meaning: '滅除蟻患。' },
  { name: '普渡', meaning: '中元普渡，超度孤魂。' },
  { name: '開柱眼', meaning: '鑿穿樑柱榫孔。' },
  { name: '造廟', meaning: '興建寺廟。' },
  { name: '合脊', meaning: '屋頂封脊蓋瓦。' },
  { name: '造橋', meaning: '建造橋樑。' },
  { name: '造船', meaning: '建造舟船。' },
  { name: '割蜜', meaning: '採集蜂蜜。' },
  { name: '針灸', meaning: '中醫針灸療法。' },
  { name: '問名', meaning: '古婚禮六禮之一，男方詢問女方姓名八字。' },
  { name: '諸事不宜', meaning: '一切事務皆不宜進行。' },
  { name: '雕刻', meaning: '雕刻佛像、印章或藝術品。' },
  { name: '納婿', meaning: '招贅入贅。' },
  { name: '習藝', meaning: '學習技藝、拜師受業。' },
  { name: '歸岫', meaning: '隱居返鄉、退隱山居。' },
  { name: '雇傭', meaning: '雇用僕役、員工。' },
  { name: '修門', meaning: '修理或更換大門。' },
  { name: '歸寧', meaning: '已嫁女子回娘家。' },
  { name: '行喪', meaning: '出殯送葬。' },
  { name: '分居', meaning: '分家、分戶居住。' },
  { name: '乘船', meaning: '搭船渡水、出海行船。' },
  { name: '無', meaning: '無特別宜忌事項。' },
  { name: '啟鑽', meaning: '啟開棺木、改葬遷墳（同「啟攢」）。' },
  { name: '酬神', meaning: '酬謝神明，還願祭祀。' },
];

// lunar-javascript returns simplified Chinese for some terms (开市, 挂匾, 开光);
// our meanings dict uses traditional. Map only the chars that appear in our vocab.
const S_TO_T: Record<string, string> = {
  开: '開', 绘: '繪', 斋: '齋', 订: '訂', 纳: '納',
  动: '動', 梁: '樑', 启: '啟', 攒: '攢', 坟: '墳',
  货: '貨', 财: '財', 种: '種', 养: '養', 医: '醫',
  诉: '訴', 讼: '訟', 会: '會', 进: '進', 经: '經',
  络: '絡', 酝: '醞', 酿: '釀', 结: '結', 网: '網',
  渔: '漁', 学: '學', 仓: '倉', 扫: '掃', 补: '補',
  盖: '蓋', 涂: '塗', 头: '頭', 发: '髮', 挂: '掛',
  乘: '乘', 务: '務', 馀: '餘', 词: '詞', 亲: '親',
  门: '門', 殓: '殮', 钻: '鑽', 机: '機', 竖: '豎',
  坏: '壞', 谢: '謝', 猎: '獵', 车: '車', 饰: '飾',
  墙: '牆', 马: '馬', 产: '產', 厕: '廁', 帐: '帳',
  筑: '築', 寿: '壽', 断: '斷', 蚁: '蟻', 庙: '廟',
  桥: '橋', 针: '針', 问: '問', 诸: '諸', 习: '習',
  艺: '藝', 归: '歸', 佣: '傭', 宁: '寧', 丧: '喪',
  无: '無',
};

function toTraditional(s: string): string {
  let out = '';
  for (const c of s) out += S_TO_T[c] ?? c;
  return out;
}

const MEANING_LOOKUP: Record<string, string> = ACTIVITY_MEANINGS.reduce(
  (acc, item) => {
    acc[item.name] = item.meaning;
    return acc;
  },
  {} as Record<string, string>,
);

/** Build a meanings list from a list of activity names (e.g. day.yi).
 *  Tries direct match first, then a simplified→traditional fallback so terms
 *  like `开市` resolve to `開市`. Activities still without a known meaning
 *  are filtered out. */
export function meaningsFor(names: readonly string[]): ActivityMeaning[] {
  const result: ActivityMeaning[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    const meaning = MEANING_LOOKUP[name] ?? MEANING_LOOKUP[toTraditional(name)];
    if (meaning) result.push({ name, meaning });
  }
  return result;
}

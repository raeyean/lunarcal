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
];

const MEANING_LOOKUP: Record<string, string> = ACTIVITY_MEANINGS.reduce(
  (acc, item) => {
    acc[item.name] = item.meaning;
    return acc;
  },
  {} as Record<string, string>,
);

/** Build a meanings list from a list of activity names (e.g. day.yi). Items
 *  without a known meaning fall through with an em-dash placeholder so the
 *  user still sees the term they tapped. */
export function meaningsFor(names: readonly string[]): ActivityMeaning[] {
  return names.map(name => ({
    name,
    meaning: MEANING_LOOKUP[name] ?? '—',
  }));
}

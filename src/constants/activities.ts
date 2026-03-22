// src/constants/activities.ts

export interface ActivityCategory {
  key: string;
  label: string;
  activities: string[];
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { key: 'life', label: '人生大事', activities: ['嫁娶', '納采', '訂盟', '冠笄'] },
  { key: 'home', label: '居家', activities: ['搬家', '入宅', '修造', '動土', '安床', '安門'] },
  { key: 'business', label: '商業', activities: ['開市', '交易', '立券', '掛匾', '開倉'] },
  { key: 'construction', label: '建築', activities: ['上樑', '豎柱', '破土', '起基', '造屋'] },
  { key: 'travel', label: '出行', activities: ['出行', '移徙', '赴任'] },
  { key: 'spiritual', label: '祭祀', activities: ['祭祀', '祈福', '求嗣', '齋醮', '開光'] },
  { key: 'burial', label: '喪葬', activities: ['安葬', '啟鑽', '除服', '成服'] },
  { key: 'agriculture', label: '農牧', activities: ['栽種', '牧養', '納畜', '伐木'] },
];

// Additional common activities from lunar-javascript not covered by curated categories
const EXTRA_ACTIVITIES = [
  '納財', '沐浴', '解除', '掃舍', '塞穴', '餘事勿取',
  '安香', '會親友', '進人口', '經絡', '醞釀',
  '裁衣', '合帳', '安機械', '放水', '開渠',
  '求醫', '治病', '詞訟', '取漁', '畋獵',
];

export const ALL_ACTIVITIES: string[] = [
  ...ACTIVITY_CATEGORIES.flatMap(c => c.activities),
  ...EXTRA_ACTIVITIES,
];

import type { StageConfig, StageId } from '../types/game';

export const STAGES: Record<StageId, StageConfig> = {
  1: {
    id: 1,
    name: 'লেভেল ১: কাদার রাস্তা',
    subtitle: 'রাস্তা ভাঙা, ম্যানহোল খোলা! সাবধানে লাফাও!',
    targetMeters: 250,
    bgTheme: 'day',
    speedMultiplier: 1.0,
    obstacleTypes: ['POTHOLE', 'MUD', 'BRICKS'],
    description: 'ঢাকার সাধারণ সকাল। ভাঙা রাস্তায় কাদা ও খোলা ম্যানহোল এড়িয়ে দৌড়াও!'
  },
  2: {
    id: 2,
    name: 'লেভেল ২: জ্যামের শহর',
    subtitle: 'রিকশা আর সিএনজির মেলা! লেন বদলাও!',
    targetMeters: 600,
    bgTheme: 'traffic',
    speedMultiplier: 1.25,
    obstacleTypes: ['RICKSHAW', 'CNG', 'TEA_STALL', 'POTHOLE'],
    description: 'রাস্তায় তীব্র জ্যাম! রঙিন রিকশা আর সবুজ সিএনজি কাটিয়ে সামনে এগোও।'
  },
  3: {
    id: 3,
    name: 'লেভেল ৩: হেলপারের ডাক',
    subtitle: 'মতিঝিলের বাস কোনটা? হেলপারের ডাকে কান দাও!',
    targetMeters: 950,
    bgTheme: 'bus_stand',
    speedMultiplier: 1.4,
    obstacleTypes: ['SLOW_BUS', 'RICKSHAW', 'CNG', 'MUD'],
    description: 'বাস স্ট্যান্ড চলে এসেছে! সঠিক গন্তব্যের বাসে উঠতে হবে।'
  },
  4: {
    id: 4,
    name: 'লেভেল ৪: বৃষ্টির দিন',
    subtitle: 'আষাঢ়ের বৃষ্টি, পিচ্ছিল সড়ক! ছাতা ধরো!',
    targetMeters: 1400,
    bgTheme: 'rain',
    speedMultiplier: 1.55,
    obstacleTypes: ['MUD', 'POTHOLE', 'BAMBOO', 'RICKSHAW'],
    description: 'হঠাৎ মুষলধারে বৃষ্টি শুরু! পিচ্ছিল সড়কে পা পিছলে না পড়ে দৌড়াও।'
  },
  5: {
    id: 5,
    name: 'লেভেল ৫: বাসের ভেতরের যুদ্ধ',
    subtitle: 'বাসের ভেতর ঝুলে ব্যালেন্স রাখো! দরজায় যাও!',
    targetMeters: 1800,
    bgTheme: 'interior',
    speedMultiplier: 1.7,
    obstacleTypes: ['SLOW_BUS', 'CNG', 'RICKSHAW', 'POTHOLE', 'MUD'],
    description: 'বাসে তো উঠলে, এবার ব্রেক কষলে ব্যালেন্স রাখতে হবে আর নামতে হবে!'
  },
  6: {
    id: 6,
    name: 'বোনাস: ঢাকার কিংবদন্তি',
    subtitle: 'তুমি ঢাকার আসল বস! অনন্ত দৌড়!',
    targetMeters: 99999,
    bgTheme: 'traffic',
    speedMultiplier: 1.85,
    obstacleTypes: ['SLOW_BUS', 'CNG', 'RICKSHAW', 'POTHOLE', 'MUD', 'BAMBOO', 'TEA_STALL'],
    description: 'কোনো জ্যাম তোমাকে আটকাতে পারবে না!'
  }
};

export const FUNNY_QUOTES = {
  start: [
    'আজকে আর লেট করা যাবে না!',
    'বসের ফোন আসার আগেই বাসে উঠতে হবে!',
    'আজকে নয়টা বাজার আগেই মতিঝিল ঢুকব!',
    'দেরি হয়ে গেছে, বস! এবার দৌড়াও!'
  ],
  running: [
    'বাসটা ছাড়িস না, ভাই!',
    'ভাড়া পরে দিমু, আগে বাসে উঠি!',
    'পা বাড়াও, চাকরি বাঁচাও!',
    'বসের বকা নিশ্চিত, তবুও দৌড়াও!'
  ],
  nearMiss: [
    'আজকে ভাগ্য ভালো! অল্পের জন্য বাঁচলাম!',
    'মাটির রিকশা, আকাশে ড্রোন!',
    'উফফ! একটুর জন্য গর্তে পড়ি নাই!',
    'ক্লোজ কল! সাবাশ বস!'
  ],
  mudSlip: [
    'জুতা গেল, ইজ্জত গেল!',
    'কাদার মধ্যে পা পিছলে আলুর দম!',
    'হায়রে নতুন প্যান্টটা শেষ!',
    'রাস্তা নাকি সুইমিং পুল!'
  ],
  busApproach: [
    'ভাই একটু দাঁড়ান! আমি আসতেছি!',
    'গেটে একজন ঝুলে আছে, আমিও ঝুলমু!',
    'ভাই একটু জায়গা দেন!',
    'এই বাস না পাইলে চাকরি শেষ!'
  ],
  wrongBus: [
    'হায় হায়! এইটা তো গাজীপুর যায়!',
    'মতিঝিল যাওয়ার কথা ছিল, চলে আসলাম কুমিল্লা!',
    'ভুল বাসের ভিআইপি যাত্রী হয়ে গেলাম রে!',
    'ভাই নামান! আমার অফিস অন্য দিকে!'
  ],
  correctBus: [
    'মতিঝিল ডাইরেক্ট! সাবাশ বস!',
    'গেটে ঝুলে হলেও ঠিক বাসে উঠেছি!',
    'আজকে অফিস টাইমলি পৌঁছানো কনফার্ম!',
    'ঢাকার রাস্তায় আমিই বস!'
  ],
  busInterior: [
    'ভাই একটু সামনে আগান!',
    'পিছনে তো সিট খালি, চিপায় দাঁড়ায় আছেন ক্যান!',
    'ব্রেক মারলে আমার উপর পড়বেন না ভাই!',
    'গেটের মুখ ছাড়েন, নামতে দেন!'
  ],
  gameOver: [
    'বস, আজকে আর অফিস যাওয়া হলো না।',
    'বস ফোন দিয়ে বলছে— কাল থেকে আর আসার দরকার নাই!',
    'জাতীয় লেট মাস্টারের খেতাব পেয়ে গেলেন!',
    'জ্যাম আর কাদার কাছে পরাজয় স্বীকার!'
  ]
};

// Generates funny title and commentary based on run stats
export function generateRunResult(stats: {
  score: number;
  distance: number;
  coins: number;
  busesCaught: number;
  wrongBuses: number;
  stageReached: number;
  slips: number;
}) {
  let title = 'ঢাকার সাধারণ পথিক';
  let comment = '';

  if (stats.wrongBuses > 1) {
    title = 'ভুল বাসের VIP যাত্রী';
    comment = `মতিঝিল যেতে গিয়ে ${stats.wrongBuses} বার ভুল বাসে উঠে গেছ! বস ফোন দিয়ে বলছে কাল থেকে আর আসতে হবে না!`;
  } else if (stats.slips >= 3) {
    title = 'জাতীয় লেট মাস্টার (কাদা স্পেশাল)';
    comment = `${stats.slips} বার কাদার মধ্যে আছাড় খেয়ে জুতা হারিয়েছ! তবুও তুমি হাল ছাড়োনি!`;
  } else if (stats.distance < 200) {
    title = 'বিছানা থেকে নামতেই লেট';
    comment = 'দৌড় শুরু করার আগেই ধাক্কা খেয়ে পড়ে গেলে? ভাই সকালে একটু ব্যায়াম করো!';
  } else if (stats.stageReached >= 5 || stats.distance >= 1500) {
    title = 'ঢাকার রাস্তার আসল বস (কিং)';
    comment = `একটানা ${stats.distance} মিটার দৌড়ে ঢাকার জ্যামকে বুড়ো আঙুল দেখিয়েছ! তুমি ঢাকার জীবন্ত কিংবদন্তি!`;
  } else if (stats.busesCaught >= 2) {
    title = 'বাস ধরার তুফান কিং';
    comment = `লোকাল বাসের গেটে ঝুলে থাকার অবিশ্বাস্য দক্ষতা দেখিয়েছেন! মতিঝিল আপনার অপেক্ষায়!`;
  } else if (stats.coins >= 30) {
    title = 'টাকার লোভী দৌড়বিদ';
    comment = `বাসের চেয়ে বেশি নজর ছিল রাস্তায় কুড়ানো কয়েনে! মোট ${stats.coins} টাকা পকেটে ভরেছেন!`;
  } else {
    title = 'জ্যামে আটকে থাকা কিংবদন্তি';
    comment = `${stats.distance} মিটার দৌড়ে অফিস যাওয়ার প্রাণান্তকর চেষ্টা ছিল প্রশংসনীয়! আরেকবার চেষ্টা করো!`;
  }

  return { title, comment };
}

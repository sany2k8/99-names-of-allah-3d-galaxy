export interface NameOfAllah {
  id: number;
  name: string;
  transliteration: string;
  english: string;
  bengali: string;
  category: 'Mercy' | 'Majesty' | 'Wisdom' | 'Power' | 'Justice' | 'Protection' | 'Generosity';
  explanation: string;
  benefits: string;
}

export const namesOfAllah: NameOfAllah[] = [
  {
    id: 1,
    name: "الرَّحْمَنُ",
    transliteration: "Ar-Rahman",
    english: "The Beneficent / Entirely Merciful",
    bengali: "পরম দয়াময়",
    category: "Mercy",
    explanation: "He who wills goodness and mercy for all His creatures, providing for them infinitely without distinction.",
    benefits: "Reciting this name 100 times after every obligatory prayer brings clarity of mind, removes forgetfulness, and fills the heart with compassion."
  },
  {
    id: 2,
    name: "الرَّحِيمُ",
    transliteration: "Ar-Rahim",
    english: "The Merciful / Especially Merciful",
    bengali: "অতিশয় দয়ালু",
    category: "Mercy",
    explanation: "He who bestows special mercy and blessings upon those who believe and use His bounties in the right path.",
    benefits: "Reciting this name 100 times after Fajr prayer keeps one safe from all calamities and soft-hearted towards all creation."
  },
  {
    id: 3,
    name: "الْمَلِكُ",
    transliteration: "Al-Malik",
    english: "The King / The Sovereign Lord",
    bengali: "সর্বাধিপতি",
    category: "Majesty",
    explanation: "The Absolute Ruler, who reigns supreme over all creation, visible and invisible, with absolute authority.",
    benefits: "Reciting this name frequently helps gain self-respect, financial independence, and respect in the eyes of others."
  },
  {
    id: 4,
    name: "الْقُدُّوسُ",
    transliteration: "Al-Quddus",
    english: "The Pure / The Holy",
    bengali: "অতি পবিত্র",
    category: "Majesty",
    explanation: "The One who is absolutely free from any imperfection, error, or shortcoming, and pure beyond human comprehension.",
    benefits: "Reciting this name 100 times daily purifies the heart from anxiety, spiritual diseases, and bad habits."
  },
  {
    id: 5,
    name: "السَّلَامُ",
    transliteration: "As-Salam",
    english: "The Giver of Peace / The Source of Peace",
    bengali: "শান্তি ও নিরাপত্তা দানকারী",
    category: "Mercy",
    explanation: "The Source of Peace who protects all creation from danger, and greets His righteous servants in Paradise with peace.",
    benefits: "Reciting this name 160 times over a sick person helps speed up their recovery and grants peace of mind."
  },
  {
    id: 6,
    name: "الْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    english: "The Infuser of Faith / The Guarantor",
    bengali: "নিরাপত্তা ও ঈমান দানকারী",
    category: "Protection",
    explanation: "The One who grants security, inspires faith in the hearts, and fulfills His promise of safety and reward.",
    benefits: "Reciting this name 630 times in times of fear protects against all harm and malicious schemes."
  },
  {
    id: 7,
    name: "الْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    english: "The Guardian / The Preserver",
    bengali: "মহাপরাক্রমশালী রক্ষক",
    category: "Protection",
    explanation: "The One who watches over, safeguards, and determines the outcomes of all affairs with supreme oversight.",
    benefits: "Reciting this name after performing Ghusl purifies the inner soul, making one's spiritual vision clearer."
  },
  {
    id: 8,
    name: "الْعَزِيزُ",
    transliteration: "Al-Aziz",
    english: "The Almighty / The Invincible",
    bengali: "মহাপরাক্রমশালী",
    category: "Power",
    explanation: "The All-Mighty, so honorable and powerful that He can never be defeated, nor can His will be resisted.",
    benefits: "Reciting this name 40 times after Fajr prayer for 40 consecutive days brings honor and independence from dependency on others."
  },
  {
    id: 9,
    name: "الْجَبَّارُ",
    transliteration: "Al-Jabbar",
    english: "The Compeller / The Restorer",
    bengali: "প্রতাপশালী",
    category: "Power",
    explanation: "The One who repairs what is broken, completes what is lacking, and enforces His supreme will with majesty.",
    benefits: "Reciting this name 226 times in the morning and evening protects against physical coercion, violence, and tyranny."
  },
  {
    id: 10,
    name: "الْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    english: "The Supreme / The Majestic",
    bengali: "অহংকারী বা মহিমান্বিত",
    category: "Majesty",
    explanation: "The One who reveals His greatness and majesty in all things, infinitely transcending the attributes of creation.",
    benefits: "Reciting this name before bedtime blesses the user with righteous children and general prestige."
  },
  {
    id: 11,
    name: "الْخَالِقُ",
    transliteration: "Al-Khaliq",
    english: "The Creator / The Maker",
    bengali: "সৃষ্টিকর্তা",
    category: "Power",
    explanation: "The Creator who designs and brings everything from non-existence into existence with perfect measurement.",
    benefits: "Reciting this name 100 times at night helps clear doubts and guides the soul toward truth."
  },
  {
    id: 12,
    name: "الْبَارِئُ",
    transliteration: "Al-Bari'",
    english: "The Originator / The Shaper",
    bengali: "সঠিকভাবে সৃষ্টিকারী",
    category: "Power",
    explanation: "The One who creates order, proportion, and harmony, bringing creations into physical reality flawlessly.",
    benefits: "A barren woman who fasts 7 days and recites 'Al-Khaliq, Al-Bari, Al-Musawwir' 21 times on water to break her fast will be blessed with children, Inshallah."
  },
  {
    id: 13,
    name: "الْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    english: "The Fashioner / The Bestower of Forms",
    bengali: "আকৃতি দানকারী",
    category: "Power",
    explanation: "The artist who shapes every unique creation, giving everything its distinct shape, color, and beauty.",
    benefits: "Reciting this name helps discover creative block solutions and brings beauty into one's life endeavors."
  },
  {
    id: 14,
    name: "الْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    english: "The All-Forgiving",
    bengali: "মহাক্ষমাশীল",
    category: "Mercy",
    explanation: "The One who pardons sins repeatedly, covering our faults in this world and the Hereafter.",
    benefits: "Reciting this name 100 times after Friday prayers brings forgiveness for past mistakes and minor sins."
  },
  {
    id: 15,
    name: "الْقَهَّارُ",
    transliteration: "Al-Qahhar",
    english: "The Subduer / The Absolute Vanquisher",
    bengali: "কঠোর দমনকারী",
    category: "Power",
    explanation: "The One who prevails over all obstacles, subduing all of creation to His laws and sovereignty.",
    benefits: "Reciting this name frequently helps conquer bad habits, inner passions, and earthly temptations."
  },
  {
    id: 16,
    name: "الْوَهَّابُ",
    transliteration: "Al-Wahhab",
    english: "The Supreme Bestower",
    bengali: "মহাদাতা",
    category: "Generosity",
    explanation: "The Giver of all gifts, who showers His creations with endless blessings without expecting anything in return.",
    benefits: "Reciting this name 7 times after Du'a ensures prayers are answered and opens doors of financial abundance."
  },
  {
    id: 17,
    name: "الرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    english: "The Provider / The Sustainer",
    bengali: "রিযিকদাতা",
    category: "Generosity",
    explanation: "The All-Provider, who delivers sustenance, physical food, knowledge, and spiritual light to all of creation.",
    benefits: "Reciting this name 10 times before Fajr in the four corners of your home invites barakah and wealth."
  },
  {
    id: 18,
    name: "الْفَتَّاحُ",
    transliteration: "Al-Fattah",
    english: "The Opener / The Arbitrator",
    bengali: "বিজয়দানকারী",
    category: "Wisdom",
    explanation: "The Opener of closed doors, hearts, and minds, who solves all problems and grants victories.",
    benefits: "Reciting this name 70 times with hands on your chest after Fajr purifies the heart and reveals divine knowledge."
  },
  {
    id: 19,
    name: "الْعَلِيمُ",
    transliteration: "Al-Alim",
    english: "The All-Knowing",
    bengali: "মহাজ্ঞানী",
    category: "Wisdom",
    explanation: "The One whose knowledge is complete, comprehensive, and eternal, knowing all things open and secret.",
    benefits: "Reciting this name opens the mind to learning, sharpens intellect, and invites light into the soul."
  },
  {
    id: 20,
    name: "الْقَابِضُ",
    transliteration: "Al-Qabid",
    english: "The Restrainer / The Withholder",
    bengali: "সংকুচিতকারী",
    category: "Power",
    explanation: "The One who contracts or withholds provisions, life, and blessings according to His infinite wisdom.",
    benefits: "Reciting this name on 40 morsels of bread for 40 days keeps one safe from starvation and physical pain."
  },
  {
    id: 21,
    name: "الْبَاسِطُ",
    transliteration: "Al-Basit",
    english: "The Extender / The Expander",
    bengali: "সম্প্রসারণকারী",
    category: "Generosity",
    explanation: "The One who expands, amplifies, and multiplies sustenance and mercy for whom He wills.",
    benefits: "Reciting this name 10 times after Duha (Chast) prayer while raising hands, then rubbing over the face, eliminates poverty."
  },
  {
    id: 22,
    name: "الْخَافِضُ",
    transliteration: "Al-Khafid",
    english: "The Abaser / The Humbler",
    bengali: "অবনতকারী",
    category: "Justice",
    explanation: "The One who humbles the proud, reduces arrogance, and lowers whomsoever He wills.",
    benefits: "Reciting this name 500 times fulfills spiritual needs and protects against oppressors."
  },
  {
    id: 23,
    name: "الرَّافِعُ",
    transliteration: "Ar-Rafi'",
    english: "The Exalter / The Elevater",
    bengali: "উন্নতকারী",
    category: "Majesty",
    explanation: "The One who elevates and exalts the status, rank, and spirituality of His righteous servants.",
    benefits: "Reciting this name 100 times in the middle of the night on Sundays and Thursdays brings high status and esteem."
  },
  {
    id: 24,
    name: "الْمُعِزُّ",
    transliteration: "Al-Mu'izz",
    english: "The Giver of Honor",
    bengali: "সম্মানদাতা",
    category: "Majesty",
    explanation: "The One who bestows true honor, dignity, and power upon whoever He wills.",
    benefits: "Reciting this name 140 times after Maghrib on Mondays or Fridays gives immense respect and courage."
  },
  {
    id: 25,
    name: "الْمُذِلُّ",
    transliteration: "Al-Mudhill",
    english: "The Giver of Dishonor / The Humiliator",
    bengali: "অপমানকারী",
    category: "Justice",
    explanation: "The One who debases and disgraces those who rebel against His laws and oppress others.",
    benefits: "Reciting this name 75 times and making Sajda protects against oppressors, tyrants, and jealous people."
  },
  {
    id: 26,
    name: "السَّمِيعُ",
    transliteration: "As-Sami'",
    english: "The All-Hearing",
    bengali: "সর্বশ্রোতা",
    category: "Wisdom",
    explanation: "The One who hears every sound, whisper, and silent thought in the entire universe without any limit.",
    benefits: "Reciting this name 500 times after Dhuhr on Thursdays ensures your prayers are swiftly answered."
  },
  {
    id: 27,
    name: "الْبَصِيرُ",
    transliteration: "Al-Basir",
    english: "The All-Seeing",
    bengali: "সর্বদ্রষ্টা",
    category: "Wisdom",
    explanation: "The One who sees all things, secret or manifest, microscopic or galactic, past, present, and future.",
    benefits: "Reciting this name 100 times after Friday prayer clarifies spiritual sight, improves eyesight, and attracts grace."
  },
  {
    id: 28,
    name: "الْحَكَمُ",
    transliteration: "Al-Hakam",
    english: "The Judge / The Arbitrator",
    bengali: "বিচারক",
    category: "Justice",
    explanation: "The Supreme Arbiter whose decisions are perfectly just, final, and can never be reversed.",
    benefits: "Reciting this name 99 times during the last third of the night grants wisdom, inspiration, and inner secrets."
  },
  {
    id: 29,
    name: "الْعَدْلُ",
    transliteration: "Al-Adl",
    english: "The Utterly Just",
    bengali: "ন্যায়পরায়ণ",
    category: "Justice",
    explanation: "The One who is absolute justice itself, acting with absolute fairness, balance, and righteousness.",
    benefits: "Reciting this name 104 times on a Friday night turns enemies into friends and inspires others to treat you fairly."
  },
  {
    id: 30,
    name: "اللَّطِيفُ",
    transliteration: "Al-Latif",
    english: "The Subtle One / The Most Gentle",
    bengali: "নিপুণ বা দয়ালু",
    category: "Mercy",
    explanation: "The Gentle One who knows the finest details of all things and delivers blessings in mysterious, beautiful ways.",
    benefits: "Reciting this name 133 times daily brings comfort in adversity, solves blockages, and brings sudden relief."
  },
  {
    id: 31,
    name: "الْخَبِيرُ",
    transliteration: "Al-Khabir",
    english: "The All-Aware",
    bengali: "সর্বজ্ঞানী",
    category: "Wisdom",
    explanation: "The One who is fully aware of the secret truths, inner realities, and hidden states of all creation.",
    benefits: "Reciting this name regularly helps eliminate bad habits, relieves anxiety, and reveals secrets in dreams."
  },
  {
    id: 32,
    name: "الْحَلِيمُ",
    transliteration: "Al-Halim",
    english: "The Forbearing / The Clement",
    bengali: "মহাধৈর্যশীল",
    category: "Mercy",
    explanation: "The One who does not hasten to punish, showing immense patience and giving sinners time to repent.",
    benefits: "Reciting this name on water and sprinkling it on crops or business sites protects against loss and brings barakah."
  },
  {
    id: 33,
    name: "الْعَظِيمُ",
    transliteration: "Al-Azim",
    english: "The Magnificent / The Infinite",
    bengali: "মহিমান্বিত",
    category: "Majesty",
    explanation: "The One who is magnificent, grand, and infinite in value, honor, and greatness beyond all comprehension.",
    benefits: "Reciting this name frequently invites respect, cures physical illness, and elevates one's spirit."
  },
  {
    id: 34,
    name: "الْغَفُورُ",
    transliteration: "Al-Ghafur",
    english: "The All-Forgiving / The Forgiving",
    bengali: "ক্ষমাকারী",
    category: "Mercy",
    explanation: "The One who forgives all sins, major and minor, and wipes away the traces of transgression completely.",
    benefits: "Reciting this name frequently cures physical illnesses, relieves headaches, and relieves intense sorrow."
  },
  {
    id: 35,
    name: "الشَّكُورُ",
    transliteration: "Ash-Shakur",
    english: "The Most Appreciative / Grateful",
    bengali: "কৃতজ্ঞ বা গুণগ্রাহী",
    category: "Generosity",
    explanation: "The One who appreciates and multiplies the smallest good deeds of His servants, rewarding them infinitely.",
    benefits: "Reciting this name 41 times over water and drinking it cures heavy breathing, chest tightness, and body fatigue."
  },
  {
    id: 36,
    name: "الْعَلِيُّ",
    transliteration: "Al-Aliyy",
    english: "The Most High / The Sublime",
    bengali: "উচ্চ মর্যাদাশীল",
    category: "Majesty",
    explanation: "The One who is elevated high above all creation, whose rank, power, and majesty are infinitely supreme.",
    benefits: "Reciting this name daily builds strong faith, protects against setbacks, and helps achieve high career goals."
  },
  {
    id: 37,
    name: "الْكَبِيرُ",
    transliteration: "Al-Kabir",
    english: "The Greatest / The Grand",
    bengali: "মহত্তম",
    category: "Majesty",
    explanation: "The One who is infinitely great, whose grandeur cannot be measured or imagined by any created mind.",
    benefits: "Reciting this name 100 times daily brings respect, restores lost power, and ensures success."
  },
  {
    id: 38,
    name: "الْحَفِيظُ",
    transliteration: "Al-Hafiz",
    english: "The Preserver / The Guardian",
    bengali: "সংরক্ষক",
    category: "Protection",
    explanation: "The Guardian who preserves, safeguards, and protects all life, creations, and cosmic orders from destruction.",
    benefits: "Reciting this name 99 times daily protects against physical dangers, accidents, theft, and evil eye."
  },
  {
    id: 39,
    name: "الْمُقِيتُ",
    transliteration: "Al-Muqit",
    english: "The Nourisher / The Feeder",
    bengali: "জীবনোপকরণ দাতা",
    category: "Generosity",
    explanation: "The Sustainer who creates, measures, and delivers all forms of nourishment, physical and spiritual.",
    benefits: "Reciting this name on water and giving it to an ill-mannered child improves their conduct immediately."
  },
  {
    id: 40,
    name: "الْحَسِيبُ",
    transliteration: "Al-Hasib",
    english: "The Reckoner / The Sufficiency",
    bengali: "হিসাব গ্রহণকারী",
    category: "Justice",
    explanation: "The One who is sufficient as a protector and who keeps an absolute account of every deed of His creation.",
    benefits: "Reciting 'Hasbiyallah-ul-Hasib' 77 times before sunrise and sunset protects against robbery and harassment."
  },
  {
    id: 41,
    name: "الْجَلِيلُ",
    transliteration: "Al-Jalil",
    english: "The Majestic / The Glorious",
    bengali: "মহিমান্বিত",
    category: "Majesty",
    explanation: "The One who possesses supreme majesty, sublime beauty, and absolute perfection in His essence and attributes.",
    benefits: "Writing this name with saffron on paper and keeping it in pocket invites honor, respect, and prestige."
  },
  {
    id: 42,
    name: "الْكَرِيمُ",
    transliteration: "Al-Karim",
    english: "The Most Generous / Bountiful",
    bengali: "পরম দয়ালু বা দাতা",
    category: "Generosity",
    explanation: "The One who is infinitely generous, giving gifts without being asked, and pardoning when He has power to punish.",
    benefits: "Reciting this name continuously before going to sleep earns respect of scholars, saints, and leaders."
  },
  {
    id: 43,
    name: "الرَّقِيبُ",
    transliteration: "Ar-Raqib",
    english: "The Watchful / The Vigilant",
    bengali: "তত্ত্বাবধায়ক",
    category: "Protection",
    explanation: "The One who watches over everything, observing every movement, intention, and blink of an eye.",
    benefits: "Reciting this name 7 times on your family and wealth protects them from loss, disease, and harm."
  },
  {
    id: 44,
    name: "الْمُجِيبُ",
    transliteration: "Al-Mujib",
    english: "The Responsive / The Answerer",
    bengali: "প্রার্থনা কবুলকারী",
    category: "Mercy",
    explanation: "The One who answers every prayer, call, and plea of His creatures, fulfilling their needs.",
    benefits: "Reciting this name frequently ensures that all of one's prayers (du'as) are accepted by Allah."
  },
  {
    id: 45,
    name: "الْوَاسِعُ",
    transliteration: "Al-Wasi'",
    english: "The All-Encompassing / Boundless",
    bengali: "অসীম বা সর্বব্যাপী",
    category: "Generosity",
    explanation: "The Infinite One whose knowledge, mercy, provision, and presence have no limits or boundaries.",
    benefits: "Reciting this name frequently cures spiritual and physical constriction, bringing peace and ease."
  },
  {
    id: 46,
    name: "الْحَكِيمُ",
    transliteration: "Al-Hakim",
    english: "The All-Wise",
    bengali: "মহাবিজ্ঞ বিচারক",
    category: "Wisdom",
    explanation: "The All-Wise, who designs all things with perfect correctness, meaning, and ultimate purpose.",
    benefits: "Reciting this name frequently overcomes obstacles in work and reveals inner wisdom."
  },
  {
    id: 47,
    name: "الْوَدُودُ",
    transliteration: "Al-Wadud",
    english: "The Loving One / The Affectionate",
    bengali: "প্রেমময়",
    category: "Mercy",
    explanation: "The One who loves His righteous servants intensely, and is the ultimate source of all genuine love in the universe.",
    benefits: "Reciting this name 1000 times over food and sharing it with one's spouse resolves arguments and creates deep love."
  },
  {
    id: 48,
    name: "الْمَجِيدُ",
    transliteration: "Al-Majid",
    english: "The Most Glorious",
    bengali: "মহিমান্বিত",
    category: "Majesty",
    explanation: "The One who is perfect in glory, whose generosity is infinite and whose honor is supremely high.",
    benefits: "Reciting this name frequently brings spiritual enlightenment, physical health, and forgiveness."
  },
  {
    id: 49,
    name: "الْبَاعِثُ",
    transliteration: "Al-Ba'ith",
    english: "The Resurrector / The Awakener",
    bengali: "পুনরুত্থানকারী",
    category: "Power",
    explanation: "The One who resurrects all of creation on the Day of Judgment, and who awakens faith in dead hearts.",
    benefits: "Reciting this name 101 times at bedtime fills the heart with fear of Allah and inspires righteousness."
  },
  {
    id: 50,
    name: "الشَّهِيدُ",
    transliteration: "Ash-Shahid",
    english: "The All-Witnessing",
    bengali: "প্রত্যক্ষদর্শী",
    category: "Wisdom",
    explanation: "The One from whom nothing is hidden; He is present everywhere and witnesses every action and thought.",
    benefits: "Reciting this name over a disobedient family member corrects their character and inspires respect."
  },
  {
    id: 51,
    name: "الْحَقُّ",
    transliteration: "Al-Haqq",
    english: "The Absolute Truth",
    bengali: "সত্য",
    category: "Wisdom",
    explanation: "The One who is the ultimate reality, whose existence is absolute, eternal, and unchanging.",
    benefits: "Reciting 'La ilaha illallah al-malik al-haqq al-mubin' 100 times daily saves from poverty and loneliness of the grave."
  },
  {
    id: 52,
    name: "الْوَكِيلُ",
    transliteration: "Al-Wakil",
    english: "The Trustee / The Disposer of Affairs",
    bengali: "পরম ভরসাযোগ্য উকিল",
    category: "Protection",
    explanation: "The Ultimate Trustee who manages, secures, and completes all affairs for those who place their trust in Him.",
    benefits: "Reciting this name continuously during calamities protects against fire, drowning, and evil forces."
  },
  {
    id: 53,
    name: "الْقَوِيُّ",
    transliteration: "Al-Qawiyy",
    english: "The All-Strong / The Powerful",
    bengali: "মহাশক্তিধর",
    category: "Power",
    explanation: "The One whose strength is absolute, inexhaustible, and completely independent of any helper.",
    benefits: "Reciting this name protects against enemies, oppressive rulers, and keeps physically weak individuals energized."
  },
  {
    id: 54,
    name: "الْمَتِينُ",
    transliteration: "Al-Matin",
    english: "The Firm / The Steadfast",
    bengali: "সুদৃঢ়",
    category: "Power",
    explanation: "The One who is infinitely firm, whose power can never be diminished, and who never experiences fatigue.",
    benefits: "Reciting this name regularly cures physical ailments, emotional stress, and brings spiritual stability."
  },
  {
    id: 55,
    name: "الْوَلِيُّ",
    transliteration: "Al-Waliyy",
    english: "The Protecting Friend / Patron",
    bengali: "অভিভাবক ও সাহায্যকারী",
    category: "Protection",
    explanation: "The Loving Guardian and Friend of the believers, who supports them and guides them out of darkness.",
    benefits: "Reciting this name frequently blesses the home, helps in spiritual growth, and resolves negative habits."
  },
  {
    id: 56,
    name: "الْحَمِيدُ",
    transliteration: "Al-Hamid",
    english: "The All-Praiseworthy",
    bengali: "প্রশংসিত",
    category: "Majesty",
    explanation: "The One who deserves all praise and appreciation, praised by all creation by virtue of His infinite beauty.",
    benefits: "Reciting this name 99 times after prayers illuminates the face, clarifies speech, and gains love of others."
  },
  {
    id: 57,
    name: "الْمُحْصِي",
    transliteration: "Al-Muhsi",
    english: "The Appraiser / Numberer of All",
    bengali: "হিসাব রক্ষক",
    category: "Wisdom",
    explanation: "The One who counts and knows the precise quantity of all things, leaving nothing unrecorded.",
    benefits: "Reciting this name 20 times daily and blowing over bread softens the heart of your enemies."
  },
  {
    id: 58,
    name: "الْمُبْدِئُ",
    transliteration: "Al-Mubdi'",
    english: "The Originator / Initiator",
    bengali: "প্রথম সৃষ্টি কর্তা",
    category: "Power",
    explanation: "The One who initiates creation out of nothingness, without any pre-existing blueprint or model.",
    benefits: "Reciting this name over a pregnant woman protects her from miscarriage and eases child delivery."
  },
  {
    id: 59,
    name: "الْمُعِيدُ",
    transliteration: "Al-Mu'id",
    english: "The Restorer",
    bengali: "পুনরায় জীবন দানকারী",
    category: "Power",
    explanation: "The One who restores creation back to life after its death, resurrecting them for accounting.",
    benefits: "Reciting this name 70 times for a missing person helps locate them or brings them back home safely."
  },
  {
    id: 60,
    name: "الْمُحْيِي",
    transliteration: "Al-Muhyi",
    english: "The Giver of Life",
    bengali: "জীবন দানকারী",
    category: "Power",
    explanation: "The One who grants life, revives dead cells, brings souls into bodies, and restores dead lands.",
    benefits: "Reciting this name over an ill person helps cure chronic illnesses and reduces spiritual lethargy."
  },
  {
    id: 61,
    name: "الْمُمِيتُ",
    transliteration: "Al-Mumit",
    english: "The Bringer of Death",
    bengali: "মৃত্যু দানকারী",
    category: "Power",
    explanation: "The One who decrees and executes death upon all living things when their appointed time arrives.",
    benefits: "Reciting this name helps control bad temptations, inner lust, and excessive worldly attachments."
  },
  {
    id: 62,
    name: "الْحَيُّ",
    transliteration: "Al-Hayy",
    english: "The Ever-Living",
    bengali: "চিরঞ্জীব",
    category: "Power",
    explanation: "The One who is eternally alive, possessing an absolute, perfect life that has no beginning and no end.",
    benefits: "Reciting 'Ya Hayyu Ya Qayyum' 3000 times daily cures chronic sickness and brings extraordinary energy."
  },
  {
    id: 63,
    name: "الْمُقَيِّمُ",
    transliteration: "Al-Qayyum",
    english: "The Self-Subsisting / Sustainer",
    bengali: "স্বয়ম্ভু",
    category: "Power",
    explanation: "The Self-Sufficient One who sustains all of creation, keeping the universe in perfect operation.",
    benefits: "Reciting this name in the early morning ensures material barakah, intelligence, and peaceful sleep."
  },
  {
    id: 64,
    name: "الْوَاجِدُ",
    transliteration: "Al-Wajid",
    english: "The Finder / The Perceiver",
    bengali: "আবিষ্কারক",
    category: "Generosity",
    explanation: "The One who finds whatever He wills, whenever He wills, and who never lacks or loses anything.",
    benefits: "Reciting this name while eating food gives spiritual strength, lighting up your inner soul."
  },
  {
    id: 65,
    name: "الْمَاجِدُ",
    transliteration: "Al-Majid",
    english: "The Glorious / Noble",
    bengali: "মহিমান্বিত",
    category: "Majesty",
    explanation: "The One who is noble, highly respected, and whose generosity and grace are boundlessly grand.",
    benefits: "Reciting this name in solitude fills the heart with pure spiritual light and divine love."
  },
  {
    id: 66,
    name: "الْوَاحِدُ",
    transliteration: "Al-Wahid",
    english: "The Unique / The One",
    bengali: "একক",
    category: "Majesty",
    explanation: "The One who is unique and singular in His essence, actions, and attributes, with no partners or equals.",
    benefits: "Reciting this name 1000 times in private removes fear of people and cleanses negative thoughts."
  },
  {
    id: 67,
    name: "الْأَحَدُ",
    transliteration: "Al-Ahad",
    english: "The Indivisible / One",
    bengali: "এক",
    category: "Majesty",
    explanation: "The Absolute Singular One, who is indivisible, unique, and entirely self-sufficient in His oneness.",
    benefits: "Reciting this name 1000 times reveals spiritual secrets and protects against major trials."
  },
  {
    id: 68,
    name: "الصَّمَدُ",
    transliteration: "As-Samad",
    english: "The Eternal / Self-Sufficient",
    bengali: "অমুখাপেক্ষী",
    category: "Majesty",
    explanation: "The Self-Sufficient Master upon whom all creation depends for their needs, while He depends on no one.",
    benefits: "Reciting this name 115 times at Fajr while in Sajda makes one independent of others' favors."
  },
  {
    id: 69,
    name: "الْقَادِرُ",
    transliteration: "Al-Qadir",
    english: "The Capable / All-Powerful",
    bengali: "ক্ষমতাবান",
    category: "Power",
    explanation: "The One who is capable of doing anything He wills, with absolute authority and power over all possibilities.",
    benefits: "Reciting this name 41 times before any difficult task ensures success and removes anxiety."
  },
  {
    id: 70,
    name: "الْمُقْتَدِرُ",
    transliteration: "Al-Muqtadir",
    english: "The Omnipotent / Determinant",
    bengali: "প্রভাবশালী",
    category: "Power",
    explanation: "The One who executes His supreme power and decrees throughout the cosmos with absolute precision and force.",
    benefits: "Reciting this name upon waking up ensures that all of your daily tasks are completed seamlessly."
  },
  {
    id: 71,
    name: "الْمُقَدِّمُ",
    transliteration: "Al-Muqaddim",
    english: "The Expediter / Promoter",
    bengali: "অগ্রগামীকারী",
    category: "Power",
    explanation: "The One who brings forward, promotes, and accelerates things according to His wise planning.",
    benefits: "Reciting this name on the battlefield or in times of high stress gives infinite courage and protection."
  },
  {
    id: 72,
    name: "الْمُؤَخِّرُ",
    transliteration: "Al-Mu'akhkhir",
    english: "The Delayer / Postponer",
    bengali: "বিলম্বকারী",
    category: "Power",
    explanation: "The One who delays, holds back, and postpones events and punishments according to His absolute wisdom.",
    benefits: "Reciting this name 100 times daily purifies the heart and increases complete reliance (tawakkul) on Allah."
  },
  {
    id: 73,
    name: "الْأَوَّلُ",
    transliteration: "Al-Awwal",
    english: "The First",
    bengali: "প্রথম",
    category: "Majesty",
    explanation: "The One who exists before anything else, having no beginning, the absolute source of all existence.",
    benefits: "Reciting this name 1000 times on 40 Fridays blesses a childless couple with righteous descendants."
  },
  {
    id: 74,
    name: "الْآخِرُ",
    transliteration: "Al-Akhir",
    english: "The Last",
    bengali: "শেষ",
    category: "Majesty",
    explanation: "The One who remains after everything has perished, having no end, the final destination of all creation.",
    benefits: "Reciting this name 1000 times daily clears the heart of worldly worries and ensures a peaceful end."
  },
  {
    id: 75,
    name: "الظَّاهِرُ",
    transliteration: "Az-Zahir",
    english: "The Manifest / Evident",
    bengali: "প্রকাশ্য",
    category: "Wisdom",
    explanation: "The One who is manifest and clear, whose existence is proven by the signs and order of the universe.",
    benefits: "Reciting this name 15 times after Friday prayers fills the heart with divine light (Noor)."
  },
  {
    id: 76,
    name: "الْبَاطِنُ",
    transliteration: "Al-Batin",
    english: "The Hidden / Imperceptible",
    bengali: "অপ্রকাশ্য বা গোপন",
    category: "Wisdom",
    explanation: "The One who is hidden and imperceptible to human senses, yet closer to us than our jugular vein.",
    benefits: "Reciting this name 33 times daily helps reveal the inner realities of things and brings peace."
  },
  {
    id: 77,
    name: "الْوَالِي",
    transliteration: "Al-Wali",
    english: "The Governor / Patron",
    bengali: "অভিভাবক",
    category: "Protection",
    explanation: "The Sole Governor who rules, manages, and directs all events in the cosmos with absolute wisdom.",
    benefits: "Reciting this name over your home protects it from lightning, storms, and all physical and spiritual harm."
  },
  {
    id: 78,
    name: "الْمُتَعَالِي",
    transliteration: "Al-Muta'ali",
    english: "The Supreme Exalted",
    bengali: "উচ্চ মর্যাদাসম্পন্ন",
    category: "Majesty",
    explanation: "The One who is supremely exalted above all defects, limitations, and conceptions of creation.",
    benefits: "Reciting this name frequently during critical trials brings sudden ease and solves complex problems."
  },
  {
    id: 79,
    name: "الْبَرُّ",
    transliteration: "Al-Barr",
    english: "The Source of Goodness",
    bengali: "কল্যাণকারী",
    category: "Generosity",
    explanation: "The Source of Goodness and Benignity, who is exceptionally kind, treating His creations with endless generosity.",
    benefits: "Reciting this name daily protects kids from calamities and removes addiction and bad habits."
  },
  {
    id: 80,
    name: "التَّوَّابُ",
    transliteration: "At-Tawwab",
    english: "The Ever-Pardoning / Relenting",
    bengali: "তওবা কবুলকারী",
    category: "Mercy",
    explanation: "The Acceptor of Repentance, who guides His servants to repent and accepts their sincere apologies repeatedly.",
    benefits: "Reciting this name 360 times daily ensures your repentance is accepted and protects against temptations."
  },
  {
    id: 81,
    name: "الْمُنْتَقِمُ",
    transliteration: "Al-Muntaqim",
    english: "The Avenger",
    bengali: "প্রতিশোধ গ্রহণকারী",
    category: "Justice",
    explanation: "The Avenger who justly punishes those who persist in rebellion and oppress innocent creations.",
    benefits: "Reciting this name for 3 Fridays protects against oppressors and breaks hostile conspiracies."
  },
  {
    id: 82,
    name: "الْعَفُوُّ",
    transliteration: "Al-Afuww",
    english: "The Pardoner / Effacer",
    bengali: "ক্ষমাশীল",
    category: "Mercy",
    explanation: "The Pardoner who completely effaces sins, leaving no record or trace of them in our book of deeds.",
    benefits: "Reciting this name frequently, especially in Laylat-ul-Qadr, wipes away major sins and brings peace."
  },
  {
    id: 83,
    name: "الرَّؤُوفُ",
    transliteration: "Ar-Ra'uf",
    english: "The Most Compassionate",
    bengali: "অতিশয় দয়াদ্র",
    category: "Mercy",
    explanation: "The One who is extremely kind, merciful, and gentle, whose compassion is supreme and protective.",
    benefits: "Reciting this name 286 times daily softens the hearts of angry people and fills your heart with kindness."
  },
  {
    id: 84,
    name: "مَالِكُ الْمُلْكِ",
    transliteration: "Malik-ul-Mulk",
    english: "Master of All Sovereignty",
    bengali: "মহাবিশ্বের সার্বভৌম অধিপতি",
    category: "Majesty",
    explanation: "The Absolute Owner of all sovereignty, kingdoms, and authority in the entire universe.",
    benefits: "Reciting this name 100 times daily eliminates doubts, grants self-reliance, and clears debts."
  },
  {
    id: 85,
    name: "ذُو الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Dhu-l-Jalali wa-l-Ikram",
    english: "Lord of Majesty and Generosity",
    bengali: "মহিমান্বিত ও দয়াময় আল্লাহ",
    category: "Majesty",
    explanation: "The One who possesses supreme majesty, absolute perfection, and who is the source of all honor and bounty.",
    benefits: "Reciting this name regularly ensures that your prayers (du'as) are answered and grants spiritual power."
  },
  {
    id: 86,
    name: "الْمُقْسِطُ",
    transliteration: "Al-Muqsit",
    english: "The Equitable / Requiter of Justice",
    bengali: "ন্যায়পরায়ণ",
    category: "Justice",
    explanation: "The Equitable One who acts with absolute fairness, resolving conflicts and delivering justice to the oppressed.",
    benefits: "Reciting this name 700 times daily protects against devilish whispers during prayers and tasks."
  },
  {
    id: 87,
    name: "الْجَامِعُ",
    transliteration: "Al-Jami'",
    english: "The Gatherer / Unifier",
    bengali: "একত্রকারী",
    category: "Justice",
    explanation: "The Gatherer who assembles all of creation on the Day of Resurrection, and who unites hearts and paths.",
    benefits: "Reciting this name help find lost items, reunites families, and attracts good friends."
  },
  {
    id: 88,
    name: "الْغَنِيُّ",
    transliteration: "Al-Ghaniyy",
    english: "The Self-Sufficient / Rich",
    bengali: "ঐশ্বর্যশালী",
    category: "Generosity",
    explanation: "The All-Rich and Self-Sufficient, who needs absolutely nothing from anyone, while all depend on Him.",
    benefits: "Reciting this name 70 times daily brings wealth, removes financial worries, and heals sickness."
  },
  {
    id: 89,
    name: "الْمُغْنِي",
    transliteration: "Al-Mughni",
    english: "The Enricher",
    bengali: "অভাবমোচনকারী",
    category: "Generosity",
    explanation: "The Enricher who satisfies the needs of His creation and makes whom He wills rich and self-sufficient.",
    benefits: "Reciting this name 1000 times after Friday prayers brings inner peace, barakah, and prosperity."
  },
  {
    id: 90,
    name: "الْمَانِعُ",
    transliteration: "Al-Mani'",
    english: "The Withholder / Preventer",
    bengali: "প্রতিরোধকারী",
    category: "Protection",
    explanation: "The Defender who prevents, withholds, or blocks danger and hardships from reaching His servants.",
    benefits: "Reciting this name at bedtime resolves marital misunderstandings and protects against accidents."
  },
  {
    id: 91,
    name: "الضَّارُّ",
    transliteration: "Ad-Darr",
    english: "The Distresser / Harmer",
    bengali: "ক্ষতিসাধনকারী",
    category: "Power",
    explanation: "The One who decrees harm, trials, and difficulties according to His wise testing and justice.",
    benefits: "Reciting this name 100 times on Friday nights brings safety from physical and spiritual calamities."
  },
  {
    id: 92,
    name: "النَّافِعُ",
    transliteration: "An-Nafi'",
    english: "The Propitious / Benefactor",
    bengali: "কল্যাণকর্তা",
    category: "Generosity",
    explanation: "The Source of Good who grants all benefits, utility, and positive advancements to His creation.",
    benefits: "Reciting this name continuously in a journey or task ensures safety, success, and high rewards."
  },
  {
    id: 93,
    name: "النُّورُ",
    transliteration: "An-Nur",
    english: "The Light",
    bengali: "জ্যোতি",
    category: "Wisdom",
    explanation: "The Divine Light that illuminates the entire universe and guides the hearts of the believers.",
    benefits: "Reciting this name 256 times on Friday nights illuminates the soul and brings clarity to your mind."
  },
  {
    id: 94,
    name: "الْهَادِي",
    transliteration: "Al-Hadi",
    english: "The Guide",
    bengali: "পথপ্রদর্শক",
    category: "Wisdom",
    explanation: "The Guide who directs His creations to their survival, and guides His chosen servants to salvation.",
    benefits: "Reciting this name frequently grants wisdom, increases spiritual focus, and keeps you on the right path."
  },
  {
    id: 95,
    name: "الْبَدِيعُ",
    transliteration: "Al-Badi'",
    english: "The Incomparable Originator",
    bengali: "অতুলনীয় সৃষ্টিকর্তা",
    category: "Power",
    explanation: "The Unique Creator who makes everything in amazing, incomparable ways without any parallel.",
    benefits: "Reciting 'Ya Badi-al-Aja'ib bil-Khair Ya Badi' 1200 times for 12 days solves any impossible problem."
  },
  {
    id: 96,
    name: "الْبَاقِي",
    transliteration: "Al-Baqi",
    english: "The Everlasting / Eternal",
    bengali: "চিরস্থায়ী",
    category: "Power",
    explanation: "The Everlasting One whose existence has no end, surviving all of creation eternally.",
    benefits: "Reciting this name 1000 times before sunrise on Friday keeps one safe from all trials and disasters."
  },
  {
    id: 97,
    name: "الْوَارِثُ",
    transliteration: "Al-Warith",
    english: "The Ultimate Inheritor",
    bengali: "পরম উত্তরাধিকারী",
    category: "Power",
    explanation: "The Ultimate Inheritor to whom everything returns after all possessors and their properties fade away.",
    benefits: "Reciting this name 100 times after Ishraq prayer removes fear, despair, and makes you successful."
  },
  {
    id: 98,
    name: "الرَّشِيدُ",
    transliteration: "Ar-Rashid",
    english: "The Guide to Right Path",
    bengali: "সঠিক পথপ্রদর্শক",
    category: "Wisdom",
    explanation: "The Guide to the Right Path, who conducts all affairs with perfect rectitude and supreme wisdom.",
    benefits: "Reciting this name 1000 times between Maghrib and Isha prayers solves all material and spiritual blockages."
  },
  {
    id: 99,
    name: "الصَّبُورُ",
    transliteration: "As-Sabur",
    english: "The Patient One / Extensively Patient",
    bengali: "অসীম ধৈর্যশীল",
    category: "Mercy",
    explanation: "The Patient One who does not act in haste, allowing creations time to grow, act, and repent.",
    benefits: "Reciting this name 3000 times in adversity brings extraordinary patience, relief, and peace."
  }
];

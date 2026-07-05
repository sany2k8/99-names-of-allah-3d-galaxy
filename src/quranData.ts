export interface QuranReference {
  verseAr: string;
  verseEn: string;
  citation: string;
  tafsir: string;
}

const quranDatabase: Record<number, QuranReference[]> = {
  1: [
    {
      verseAr: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      verseEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      citation: "Al-Fatihah 1:1",
      tafsir: "Ar-Rahman denotes the infinite, all-encompassing mercy of Allah that covers all of creation, believers and non-believers alike. This mercy is creative, sustaining, and immediate, as the primary attribute with which He introduces Himself to humanity."
    },
    {
      verseAr: "الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَىٰ",
      verseEn: "The Most Merciful [who] is established above the Throne.",
      citation: "Taha 20:5",
      tafsir: "Allah's rise over the Supreme Throne of Majesty is coupled with His name Ar-Rahman (The Most Merciful), illustrating that His absolute sovereignty and cosmic authority are fundamentally guided and governed by boundless, loving mercy."
    }
  ],
  2: [
    {
      verseAr: "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ",
      verseEn: "And your Allah is one Allah; there is no deity except Him, the Entirely Merciful, the Especially Merciful.",
      citation: "Al-Baqarah 2:163",
      tafsir: "Ar-Rahim refers to the specific, targeted mercy bestowed upon those who choose the path of belief and surrender. It is a protective, guiding, and redemptive mercy that operates continuously through the trials of the earthly journey."
    }
  ],
  3: [
    {
      verseAr: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ",
      verseEn: "He is Allah, other than whom there is no deity, the Sovereign, the Pure...",
      citation: "Al-Hashr 59:23",
      tafsir: "Al-Malik represents the ultimate, true King who owns and rules the physical and metaphysical universes. Unlike mortal kings, His dominion is absolute, flawless, eternal, and free from any dependence or weakness."
    }
  ],
  4: [
    {
      verseAr: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ الْمَلِكِ الْقُدُّوسِ",
      verseEn: "Whatever is in the heavens and whatever is on the earth is exalting Allah, the Sovereign, the Pure...",
      citation: "Al-Jumu'ah 62:1",
      tafsir: "Al-Quddus indicates the sacred One who is completely holy, absolutely pure, and transcending any mortal limitations, defects, or human concepts of imperfection. He is sanctified above any resemblance to His creation."
    }
  ],
  5: [
    {
      verseAr: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ",
      verseEn: "He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection...",
      citation: "Al-Hashr 59:23",
      tafsir: "As-Salam represents the Source of Peace and Perfection. He is the One who is secure from all imperfections and who grants safety, tranquility, and inner spiritual peace to those who align their hearts with His divine guidance."
    }
  ],
  6: [
    {
      verseAr: "الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ",
      verseEn: "...the Giver of Belief, the Guardian, the Exalted in Might, the Compeller, the Superior.",
      citation: "Al-Hashr 59:23",
      tafsir: "Al-Mu'min is the supreme Giver of Faith and Security. He protects those who seek shelter in Him, confirms the truth of His prophets, and fulfills His promises of salvation and serenity to the faithful."
    }
  ],
  7: [
    {
      verseAr: "وَهُوَ عَلَىٰ كُلِّ شَيْءٍ وَكِيلٌ * لَّهُ مَقَالِيدُ السَّمَاوَاتِ وَالْأَرْضِ ۗ وَالَّذِينَ كَفَرُوا بِآيَاتِ اللَّهِ أُولَٰئِكَ هُمُ الْخَاسِرُونَ",
      verseEn: "And He is over all things Guardian. To Him belong the keys of the heavens and the earth.",
      citation: "Az-Zumar 39:62-63",
      tafsir: "Al-Muhaymin denotes the supreme Overseer and Preserver of all existence. He witnesses every action, controls all outcomes, maintains the balance of the universe, and lovingly safeguards every soul's spiritual evolutionary record."
    }
  ],
  8: [
    {
      verseAr: "إِنَّ رَبَّكَ هُوَ الْقَوِيُّ الْعَزِيزُ",
      verseEn: "Indeed, your Lord - He is the Strong, the Exalted in Might.",
      citation: "Hud 11:66",
      tafsir: "Al-Aziz represents the Almighty, the Invincible, who cannot be overcome or resisted. His honor and power are supreme, yet His strength is always accompanied by wisdom and perfect justice, never tyrannical force."
    }
  ],
  9: [
    {
      verseAr: "الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ",
      verseEn: "...the Exalted in Might, the Compeller, the Superior. Exalted is Allah above whatever they associate with Him.",
      citation: "Al-Hashr 59:23",
      tafsir: "Al-Jabbar is the Compeller and Restorer of Hearts. While He can compel His creation to conform to His cosmic laws, He is also the One who mends what is broken, heals the grief-stricken, and uplifts the oppressed who invoke Him."
    }
  ]
};

export function getQuranReferences(nameId: number, transliteration: string): QuranReference[] {
  // If we have a specific entry, return it
  if (quranDatabase[nameId]) {
    return quranDatabase[nameId];
  }

  // Fallback beautiful reference based on general Quranic wisdom
  return [
    {
      verseAr: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا",
      verseEn: "And to Allah belong the best names, so invoke Him by them.",
      citation: "Al-A'raf 7:180",
      tafsir: `This name, ${transliteration}, represents a unique gateway of divine light and contemplation. Invoking Allah through this name elevates the human intellect, cleanses spiritual blockages, and aligns the heart to receive the specific attributes of grace, power, and serenity it represents.`
    },
    {
      verseAr: "قُلِ ادْعُوا اللَّهَ أَوِ ادْعُوا الرَّحْمَٰنَ ۖ أَيًّا مَّا تَدْعُوا فَلَهُ الْأَسْمَاءُ الْحُسْنَىٰ",
      verseEn: "Say, 'Call upon Allah or call upon the Most Merciful. Whichever [name] you call - to Him belong the best names.'",
      citation: "Al-Isra 17:110",
      tafsir: `Whether you call upon Him through His majesty or His beauty, all names return to the single supreme Essence. Meditating upon ${transliteration} unlocks deeper theological wisdom and brings tranquility to the restless modern soul.`
    }
  ];
}

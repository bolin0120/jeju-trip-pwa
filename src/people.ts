export const PEOPLE = ["陸柏霖", "陳弈璇", "陳琮畲", "陳品岑", "周芃甄"] as const;
export type Person = (typeof PEOPLE)[number];

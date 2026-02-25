export type BaseAttributes = {
   str: number;
   dex: number;
   con: number;
   int: number;
   wis: number;
   cha: number;
};

export type DerivedStats = {
   hp: number;
   mp: number;
   patk: number;
   datk: number;
   matk: number;
   mdef: number;
   spd: number;
   crit: number;
   acc: number;
   eva: number;
};

export const CHARACTER_STAT_FORMULA_VERSION = 1;

const BASE_ATTRIBUTES_BY_RACE: Record<string, BaseAttributes> = {
   human: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
   elf: { str: 6, dex: 10, con: 6, int: 10, wis: 10, cha: 8 },
   orc: { str: 12, dex: 6, con: 10, int: 4, wis: 4, cha: 4 },
   undead: { str: 6, dex: 6, con: 12, int: 8, wis: 6, cha: 4 },
   dragonkin: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 6 },
};

export function getInitialBaseAttributesByRace(race: string): BaseAttributes {
   const key = (race || '').trim().toLowerCase();
   return BASE_ATTRIBUTES_BY_RACE[key] || BASE_ATTRIBUTES_BY_RACE.human;
}

export function calculateDerivedStats(base: BaseAttributes): DerivedStats {
   return {
      hp: base.con * 12 + base.str * 2,
      mp: base.wis * 10 + base.int * 4,
      patk: base.str * 3 + base.dex + base.con,
      datk: base.con * 3 + base.str + base.dex,
      matk: base.int * 3 + base.wis * 2,
      mdef: base.wis * 3 + base.int,
      spd: base.dex * 2,
      crit: base.dex,
      acc: base.dex * 2 + base.int,
      eva: base.dex * 2 + base.con,
   };
}

import seedrandom from 'seedrandom';
import type { Gender } from '@/lib/types';

const MALE_FIRST = [
  'Jan', 'Petr', 'Pavel', 'Tomáš', 'Martin', 'Michal', 'Jakub', 'Lukáš', 'Marek', 'Jiří',
  'David', 'Ondřej', 'Filip', 'Radek', 'Daniel', 'Adam', 'Václav', 'Miroslav', 'Josef', 'Roman',
];
const FEMALE_FIRST = [
  'Jana', 'Petra', 'Martina', 'Lucie', 'Eva', 'Hana', 'Kateřina', 'Alena', 'Zuzana', 'Veronika',
  'Tereza', 'Barbora', 'Markéta', 'Marie', 'Lenka', 'Klára', 'Michaela', 'Andrea', 'Iva', 'Radka',
];
const LAST = [
  'Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec',
  'Pokorný', 'Pospíšil', 'Hájek', 'Jelínek', 'Král', 'Růžička', 'Beneš', 'Fiala', 'Sedláček', 'Doležal',
  'Zeman', 'Kolář', 'Navrátil', 'Čermák', 'Urban', 'Vaněk', 'Blažek', 'Kříž', 'Kovář', 'Bartoš',
];

const femaleForm = (last: string): string => {
  if (last.endsWith('ý')) return last.slice(0, -1) + 'á';
  if (last.endsWith('a')) return last;
  return last + 'ová';
};

const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export interface Pseudonymizer {
  pseudonymize(employeeId: string, gender: Gender): { firstName: string; lastName: string };
}

export function createNamePseudonymizer(seed: number): Pseudonymizer {
  return {
    pseudonymize(employeeId: string, gender: Gender) {
      const rng = seedrandom(`${seed}:${hashString(employeeId)}`);
      const firstBank = gender === 'female' ? FEMALE_FIRST : MALE_FIRST;
      const firstName = firstBank[Math.floor(rng() * firstBank.length)]!;
      const rawLast = LAST[Math.floor(rng() * LAST.length)]!;
      const lastName = gender === 'female' ? femaleForm(rawLast) : rawLast;
      return { firstName, lastName };
    },
  };
}

import seedrandom from 'seedrandom';
import type { Gender } from '@/lib/types';

const MALE_FIRST_NAMES = [
  'Jan',
  'Petr',
  'Pavel',
  'Tomas',
  'Martin',
  'Michal',
  'Jakub',
  'Lukas',
  'Marek',
  'Jiri',
  'David',
  'Ondrej',
  'Filip',
  'Radek',
  'Daniel',
  'Adam',
  'Vaclav',
  'Miroslav',
  'Josef',
  'Roman',
];

const FEMALE_FIRST_NAMES = [
  'Jana',
  'Petra',
  'Martina',
  'Lucie',
  'Eva',
  'Hana',
  'Katerina',
  'Alena',
  'Zuzana',
  'Veronika',
  'Tereza',
  'Barbora',
  'Marketa',
  'Marie',
  'Lenka',
  'Klara',
  'Michaela',
  'Andrea',
  'Iva',
  'Radka',
];

const LAST_NAMES = [
  'Novak',
  'Svoboda',
  'Novotny',
  'Dvorak',
  'Cerny',
  'Prochazka',
  'Kucera',
  'Vesely',
  'Horak',
  'Nemec',
  'Pokorny',
  'Pospisil',
  'Hajek',
  'Jelinek',
  'Kral',
  'Ruzicka',
  'Benes',
  'Fiala',
  'Sedlacek',
  'Dolezal',
  'Zeman',
  'Kolar',
  'Navratil',
  'Cermak',
  'Urban',
  'Vanek',
  'Blazek',
  'Kriz',
  'Kovar',
  'Bartos',
];

export interface PseudonymizedName {
  firstName: string;
  lastName: string;
}

export interface Pseudonymizer {
  pseudonymize(employeeId: string, gender: Gender): PseudonymizedName;
}

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const femaleLastName = (lastName: string): string => {
  if (lastName.endsWith('y')) return `${lastName.slice(0, -1)}a`;
  if (lastName.endsWith('a')) return lastName;
  return `${lastName}ova`;
};

const choose = <T>(items: readonly T[], rng: seedrandom.PRNG): T => {
  const index = Math.floor(rng() * items.length);
  const item = items[index];
  if (item == null) throw new Error('Pseudonymizer: empty name bank');
  return item;
};

export function createNamePseudonymizer(seed: number): Pseudonymizer {
  return {
    pseudonymize(employeeId: string, gender: Gender): PseudonymizedName {
      const rng = seedrandom(`${seed}:${hashString(employeeId)}`);
      const firstName =
        gender === 'female' ? choose(FEMALE_FIRST_NAMES, rng) : choose(MALE_FIRST_NAMES, rng);
      const rawLastName = choose(LAST_NAMES, rng);

      return {
        firstName,
        lastName: gender === 'female' ? femaleLastName(rawLastName) : rawLastName,
      };
    },
  };
}

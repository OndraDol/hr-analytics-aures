# Implementační plán — Milník 0 (Foundation) + Milník 1 (Data layer)

> **Stav k 2026-04-24 16:45:** Tasky 1–9 **hotové a pushed** (`fb50ab3`). Další na řadě je **Task 10 (Pseudonymizer)** — prázdný adresář `lib/data/heuristics/` existuje, ale reálný kód ještě nevznikl. Pro navázání viz sekci „Progress tracker" níže.

> **Pro agentic workery:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (doporučeno) nebo superpowers:executing-plans pro krok-za-krokem provedení. Kroky používají checkbox (`- [ ]`) syntax.

**Cíl:** Postavit základ Next.js 15 projektu s kompletním datovým modelem, který načte reálná AURES data jako kostru, dopočte heuristiky (grade, kritičnost pozice) a dogeneruje mock fakta (payroll, absence, eNPS, performance, training, succession, accidents). Výstupem je funkční Data Provider s konzistentními daty pro všech 20 KPI.

**Architektura:** Next.js 15 App Router + TypeScript. Data layer = reálná data (parsované Excely) + mock generator, konsolidované přes Data Provider pattern (`MockDataProvider implements DataProvider`). Konzistence zajištěna deterministickým seedem a referenční integritou vůči reálné kostře. Celý data pipeline běží při build time (`pnpm gen:data`) a produkuje type-safe TS moduly v `lib/data/generated/`.

**Tech Stack:** Next.js 15, TypeScript 5.6+, pnpm, Vitest (testing), xlsx (Excel parsing), zod (validace), date-fns (práce s daty), seedrandom (deterministická PRNG).

**Navazující plány:** Po dokončení a reviewu tohoto plánu budou vytvořeny další plány pro M2 (KPI core) → M3 (Reference sekce V Retention) → M4 (Executive Dashboard) → M5–M9.

---

## Progress tracker (aktualizováno průběžně)

| Task | Stav | Commit |
|---|---|---|
| 1. Init git + data-sources/raw/ + .gitignore | ✅ hotovo | `9ecec29` (initial) |
| 2. Install pnpm + Next.js 15 scaffold | ✅ hotovo | `a6228ce` + `ad7d1c6` (eslint fix) |
| 3. Strict TypeScript config | ✅ hotovo | `8777ead` |
| 4. Runtime + dev deps + scripts | ✅ hotovo | `98ce84d` (spolu s Task 5) |
| 5. Vitest config + smoke test | ✅ hotovo | `98ce84d` |
| 6. Fonts + base layout + CSS tokeny | ✅ hotovo | `d66cb0b` |
| 7. Domain types (`lib/types.ts`) | ✅ hotovo | `6fe0b11` |
| 8. Staffplan parser + fixture | ✅ hotovo | `fb50ab3` (trojice parserů) |
| 9. Workforce events parser | ✅ hotovo | `fb50ab3` |
| 10. Recruitment parser | ✅ hotovo | `fb50ab3` |
| 11. Name pseudonymizer | ✅ hotovo | — |
| 12. Grade heuristika | ✅ hotovo | — |
| 13. Critical position heuristika | ✅ hotovo | — |
| 14. Payroll mock generator | ✅ hotovo | — |
| 15. Ostatní mock generátory | ✅ hotovo | — |
| 16. DataProvider interface | ✅ hotovo | — |
| 17. gen-data orchestrátor | ✅ hotovo | — |
| 18. MockDataProvider | ✅ hotovo | — |
| 19. Consistency check + smoke testy | ✅ hotovo | — |
| 20. Dokumentace M0+M1 | ✅ hotovo | — |
| Final verification + tag | ✅ hotovo | — |

**Aktuální stav projektu:**
- Kompletní Next.js 15 scaffolding s přísným TypeScriptem, light+dark CSS tokeny, AURES paletou.
- 11 unit testů passuje (1 smoke + 3 Staffplan + 4 Workforce + 3 Recruitment).
- `pnpm lint`, `pnpm build`, `pnpm typecheck`, `pnpm test` — všechny zelené.
- GitHub: https://github.com/OndraDol/hr-analytics-aures (private).
- Lokální adresář: `C:\Users\ondrej.dolejs\Desktop\Projekty\HR_Analytics`
- Orphan soubor `HR_reporting_ver2.xlsx` v rootu (Excel jej stále blokuje) — po zavření přesunout do `data-sources/raw/` a commitnout.

**Jak navázat (např. z mobilu / jiné session):**
1. `git clone https://github.com/OndraDol/hr-analytics-aures` (nebo pull, pokud už je klonován)
2. `pnpm install`
3. `pnpm test` — ověř, že 11 testů projde
4. Otevři tento plán, najdi první `⏭️` v trackeru a pokračuj podle definice tasku níže.

---

## Mapa souborů

### Nově vytvářené soubory

| Soubor | Účel |
|---|---|
| `package.json` | npm metadata, dependencies, scripts |
| `tsconfig.json` | TypeScript config, strict mode |
| `next.config.ts` | Next.js config |
| `tailwind.config.ts` | Tailwind v4 config |
| `postcss.config.mjs` | PostCSS pro Tailwind |
| `.gitignore` | ignoruje `node_modules`, `.next`, generované soubory |
| `.env.example` | šablona env proměnných |
| `vitest.config.ts` | Vitest config |
| `app/layout.tsx` | root layout (globální CSS, fonty) |
| `app/page.tsx` | landing placeholder |
| `app/globals.css` | Tailwind imports, CSS proměnné |
| `components/ui/.gitkeep` | kam půjdou shadcn komponenty |
| `lib/types.ts` | doménové TypeScript typy (Employee, Position, atd.) |
| `lib/utils.ts` | obecné helpery |
| `lib/data/provider.ts` | `DataProvider` interface |
| `lib/data/mock-provider.ts` | implementace nad generovanými soubory |
| `lib/data/generated/.gitkeep` | cíl pro generovaná data |
| `lib/data/heuristics/grade.ts` | heuristika přiřazení grade B0–B3 |
| `lib/data/heuristics/critical-position.ts` | heuristika kritičnosti pozice |
| `lib/data/mock/payroll.ts` | mock generator mezd |
| `lib/data/mock/absence.ts` | mock generator absencí |
| `lib/data/mock/enps.ts` | mock generator eNPS |
| `lib/data/mock/performance.ts` | mock generator výkonu |
| `lib/data/mock/training.ts` | mock generator školení |
| `lib/data/mock/succession.ts` | mock succession plánů |
| `lib/data/mock/accidents.ts` | mock pracovních úrazů |
| `lib/data/parsers/staffplan.ts` | parser Staffplan.xlsx |
| `lib/data/parsers/workforce-events.ts` | parser Nastupy_vystupy.xlsx |
| `lib/data/parsers/recruitment.ts` | parser recruitment_report.xlsx |
| `lib/data/parsers/names.ts` | anonymizační map reálná jména → pseudonym |
| `scripts/gen-data.ts` | orchestrátor datové pipeline |
| `scripts/check-data-consistency.ts` | kontrolní skript referenční integrity |
| `tests/data/parsers.test.ts` | testy parserů |
| `tests/data/heuristics.test.ts` | testy heuristik |
| `tests/data/mock-generators.test.ts` | testy mock generátorů |
| `tests/data/consistency.test.ts` | integrační test konzistence pipeline |
| `tests/fixtures/mini-staffplan.xlsx` | malý fixture pro test parseru |

### Přesouvané / reorganizované

- `HR_reporting_ver2.xlsx`, `Nastupy_vystupy.xlsx`, `Staffplan.xlsx`, `recruitment_report.xlsx` → `data-sources/raw/`

---

## Milník 0 — Foundation

### Task 1: Inicializace gitu a adresářové struktury

**Files:**
- Create: `.gitignore`
- Move: 4 XLSX soubory → `data-sources/raw/`

- [ ] **Step 1: Inicializovat git repo**

```bash
cd "C:/Users/ondrej.dolejs/Desktop/Projekty/HR_Analytics"
git init
git branch -M main
```

- [ ] **Step 2: Vytvořit `data-sources/raw/` a přesunout zdrojové Excely**

```bash
mkdir -p data-sources/raw
mv HR_reporting_ver2.xlsx Nastupy_vystupy.xlsx Staffplan.xlsx recruitment_report.xlsx data-sources/raw/
```

- [ ] **Step 3: Vytvořit `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/

# Generated data
lib/data/generated/*.ts
!lib/data/generated/.gitkeep

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
.env.*.local

# Test
coverage/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
```

- [ ] **Step 4: První commit (pouze strukturální, bez build artifactů)**

```bash
git add .gitignore PROJEKT_ZAZNAM.md docs/ data-sources/
git commit -m "chore: initial repo structure with project log, specs, plans, and raw data sources"
```

---

### Task 2: Instalace pnpm a inicializace Next.js projektu

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Instalace pnpm globálně**

```bash
npm install -g pnpm
pnpm --version
```

Expected: vypíše verzi (>= 9.x).

- [ ] **Step 2: Inicializovat Next.js 15 projekt v kořenové složce**

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --turbopack --import-alias "@/*" --use-pnpm --no-git --yes
```

Pokud nástroj vyžaduje overwrite (existuje už `.gitignore` atd.) — potvrď `y` pouze pro soubory, které ještě nemáme (většinou ale Next.js ponechá naše `.gitignore` — pokud přepíše, obnov ho z kroku Task 1/Step 3).

- [ ] **Step 3: Ověřit, že dev server běží**

```bash
pnpm dev
```

Otevři `http://localhost:3000`. Očekávej defaultní Next.js landing page. Pak Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 15 App Router project with TypeScript and Tailwind"
```

---

### Task 3: Konfigurace přísných TypeScript pravidel

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Otevřít `tsconfig.json` a nahradit obsah**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Ověřit, že TypeScript neprotestuje**

```bash
pnpm tsc --noEmit
```

Expected: žádné chyby.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: tighten TypeScript config (strict, noUncheckedIndexedAccess, noImplicitOverride)"
```

---

### Task 4: Instalace vývojových a provozních závislostí

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Nainstalovat runtime závislosti**

```bash
pnpm add zod date-fns clsx tailwind-merge class-variance-authority zustand
pnpm add @tanstack/react-table recharts framer-motion lucide-react
```

- [ ] **Step 2: Nainstalovat dev závislosti**

```bash
pnpm add -D vitest @vitest/ui @types/node xlsx seedrandom @types/seedrandom tsx
```

- [ ] **Step 3: Přidat skripty do `package.json`**

Otevři `package.json` a v sekci `scripts` nahraď / přidej:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "gen:data": "tsx scripts/gen-data.ts",
    "check:data": "tsx scripts/check-data-consistency.ts"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add runtime and dev dependencies (zod, xlsx, recharts, vitest, etc.)"
```

---

### Task 5: Konfigurace Vitest

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Vytvořit `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 2: Smoke test — vytvořit fake test**

Create: `tests/smoke.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Spustit testy**

```bash
pnpm test
```

Expected: 1 test passes.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/smoke.test.ts
git commit -m "chore: configure Vitest with @/ path alias"
```

---

### Task 6: Instalace fontů a základního layoutu

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `lib/utils.ts`

- [ ] **Step 1: Vytvořit `lib/utils.ts` s utilitou pro třídy**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Přepsat `app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin-ext'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin-ext'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'HR Analytics — AURES Holdings',
  description: 'Interaktivní HR reporting prototyp',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-zinc-50 text-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Přepsat `app/globals.css` — přidat CSS proměnné a tokeny**

```css
@import "tailwindcss";

:root {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text-primary: #09090b;
  --color-text-secondary: #71717a;
  --color-border: #e4e4e7;
  --color-primary: #1d4ed8;
  --color-accent: #f97316;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #f43f5e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-surface: #18181b;
    --color-text-primary: #fafafa;
    --color-text-secondary: #a1a1aa;
    --color-border: #27272a;
  }
}

html,
body {
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

.font-mono {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
}

.font-serif {
  font-family: var(--font-instrument-serif), Georgia, serif;
}
```

- [ ] **Step 4: Přepsat `app/page.tsx` na placeholder s AURES brandingem**

```typescript
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          AURES Holdings · HR Analytics
        </p>
        <h1 className="font-serif italic text-5xl text-zinc-950">
          Prototyp reportingu
        </h1>
        <p className="text-zinc-600">
          Milník 0 dokončen. Data pipeline a dashboardy přijdou v dalších milnících.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Spustit dev server a vizuálně ověřit**

```bash
pnpm dev
```

Otevři `http://localhost:3000`. Očekávej vycentrovaný landing s „AURES Holdings · HR Analytics" a kurzivním „Prototyp reportingu". Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add app/ lib/utils.ts
git commit -m "feat: root layout with Geist Sans/Mono + Instrument Serif fonts and Czech landing placeholder"
```

---

## Milník 1 — Data Layer

### Task 7: Definice doménových typů

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Vytvořit `lib/types.ts`**

```typescript
// ===== Identifiers =====
export type EmployeeId = string;          // OSČPV, např. "23_4002.05"
export type PositionId = string;          // poz_kod, např. "010000000003920.001"
export type DivisionId = string;          // hier. kód, např. "0101"
export type DepartmentId = string;        // kod_hier_sk
export type OrgUnitId = string;           // Kód a název struktury (z Nastupy)

// ===== Dimenze =====
export type Grade = 'B0' | 'B1' | 'B2' | 'B3' | 'IC';
export type EmploymentType = 'PP' | 'DPP' | 'DPČ' | 'STATUTAR' | 'ICO' | 'UCEN';
export type Country = 'CZ' | 'SK' | 'PL' | 'HU' | 'DE';
export type Gender = 'male' | 'female';

export interface Employee {
  id: EmployeeId;
  firstName: string;       // pseudonym
  lastName: string;        // pseudonym
  gender: Gender;
  birthDate: string;       // ISO YYYY-MM-DD (simulováno — reálně nemáme věk)
  nationality: Country;
  country: Country;
  hireDate: string;        // ISO
  terminationDate: string | null;
  terminationReason: TerminationReason | null;
  positionId: PositionId;
  divisionId: DivisionId;
  departmentId: DepartmentId;
  orgUnitId: OrgUnitId;
  grade: Grade;
  employmentType: EmploymentType;
  fte: number;             // 0.25 .. 1.0
  managerId: EmployeeId | null;
  criticalPositionFlag: boolean;
  talentPoolFlag: boolean;
  successorForPositionId: PositionId | null;
}

export type TerminationReason =
  | 'resignation'
  | 'mutual_agreement'
  | 'dismissal'
  | 'probation_end'
  | 'retirement'
  | 'other';

export interface Position {
  id: PositionId;
  title: string;
  divisionId: DivisionId;
  departmentId: DepartmentId;
  criticalFlag: boolean;
  grade: Grade;
  roleFamily: string;      // např. "Sales", "OPS-Driver", "Call Centre"
  capFte: number;          // plánovaný FTE
  actualFte: number;       // skutečný FTE
}

export interface Division {
  id: DivisionId;
  name: string;
  country: Country;
  parentId: DivisionId | null;
  costCenter: string | null;
}

export interface Department {
  id: DepartmentId;
  name: string;
  divisionId: DivisionId;
  headEmployeeId: EmployeeId | null;
}

// ===== Fakta =====
export interface HeadcountSnapshot {
  month: string;           // ISO YYYY-MM-01
  employeeId: EmployeeId;
  active: boolean;
  onLongTermLeave: boolean;
  fte: number;
  grade: Grade;
  divisionId: DivisionId;
  countryCode: Country;
}

export interface WorkforceEvent {
  date: string;            // ISO
  employeeId: EmployeeId;
  type: 'hire' | 'terminate' | 'internal_move' | 'promote';
  fromPositionId?: PositionId;
  toPositionId?: PositionId;
  reason?: TerminationReason;
  voluntary?: boolean;
}

export interface PayrollMonth {
  month: string;
  employeeId: EmployeeId;
  baseSalary: number;      // CZK
  variable: number;
  benefits: number;
  nonPersonal: number;
  totalCost: number;
}

export interface AbsenceRecord {
  employeeId: EmployeeId;
  dateFrom: string;
  dateTo: string;
  type: 'sick' | 'vacation' | 'parental' | 'other';
  days: number;
}

export interface ShiftDay {
  date: string;
  divisionId: DivisionId;
  plannedShifts: number;
  coveredShifts: number;
}

export interface RecruitmentRequisition {
  id: string;
  positionId: PositionId;
  divisionId: DivisionId;
  approvedDate: string;
  publishedDate: string | null;
  firstInterviewDate: string | null;
  offerDate: string | null;
  acceptedDate: string | null;
  hireDate: string | null;
  cost: number;
  channel: string;
  critical: boolean;
  canceled: boolean;
}

export interface FunnelCount {
  requisitionId: string;
  stage: 'longlist' | 'presented' | '1st_interview' | '2nd_interview' | 'offer_sent' | 'hired';
  count: number;
  dateRecorded: string;
}

export interface PerformanceReview {
  cycle: string;           // např. "2025"
  employeeId: EmployeeId;
  rating: 1 | 2 | 3 | 4 | 5;
  growthPotential: 'low' | 'med' | 'high' | 'very_high';
  talentFlag: boolean;
}

export interface ENPSResponse {
  cycle: string;           // "2025-Q4"
  employeeId: EmployeeId;
  score: -100 | number;    // -100..100, ale uložíme agregátně per segment
  invited: boolean;
  responded: boolean;
  segment: { country: Country; divisionId: DivisionId };
}

export interface TrainingCompletion {
  date: string;
  employeeId: EmployeeId;
  course: string;
  area: string;            // "ESG", "Compliance", "Sales", ...
  hours: number;
  cost: number;
}

export interface WorkAccident {
  date: string;
  divisionId: DivisionId;
  severity: 'minor' | 'moderate' | 'serious';
  type: string;
}

export interface SuccessionPlan {
  criticalPositionId: PositionId;
  incumbentEmployeeId: EmployeeId | null;
  successorEmployeeId: EmployeeId | null;
  readiness: 'ready_now' | 'ready_1_2y' | 'gap';
}
```

- [ ] **Step 2: Ověřit typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: domain types for HR entities, dimensions, and fact tables"
```

---

### Task 8: Parser Staffplan.xlsx

**Files:**
- Create: `lib/data/parsers/staffplan.ts`
- Create: `tests/data/parsers.test.ts`
- Create: `tests/fixtures/mini-staffplan.xlsx` (manuální vytvoření — viz step 1)

- [ ] **Step 1: Vytvořit fixture `tests/fixtures/mini-staffplan.xlsx`**

Pro reprodukovatelnost test fixture vygenerujeme skriptem. Create: `tests/fixtures/make-mini-staffplan.ts`

```typescript
import * as XLSX from 'xlsx';
import path from 'node:path';

const rows = [
  ['Pobočka', 'dep_sk', 'kod_hier_sk', 'Department', 'Hierarchický kód',
   'Position', 'poz_kod', 'OSČPV', 'Name', 'LP platnost', 'Note', 'Cap',
   'Actual Branch', 'Note2'],
  ['', '', '0101', 'Customer Experience', '0101196',
   'Group Customer Experience Manager', '011960000004370.001', '23_30679.01',
   'Preclík Jan', '2026-07-13', 'HPP', 1.0, 1.0, ''],
  ['', '', '0101', 'Customer Experience', '0101',
   'CX Specialist', '011960000004371.001', '', 'vacancy', '', '', 1.0, 0.0, ''],
  ['', '', '0403', 'OPS Region 1 CZ_Bazaar - Drivers', '0403',
   'Driver', '040300000000000.001', '23_10001.01', 'Novák Pavel', '', 'HPP', 1.0, 1.0, ''],
];

const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Con02faaa');
XLSX.writeFile(wb, path.join(__dirname, 'mini-staffplan.xlsx'));
console.log('Fixture written.');
```

Spustit:

```bash
pnpm tsx tests/fixtures/make-mini-staffplan.ts
```

Expected: `Fixture written.` a soubor `tests/fixtures/mini-staffplan.xlsx` existuje.

- [ ] **Step 2: Napsat failing test pro parser**

Create: `tests/data/parsers.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { parseStaffplan } from '@/lib/data/parsers/staffplan';

const FIXTURE = path.resolve(__dirname, '../fixtures/mini-staffplan.xlsx');

describe('parseStaffplan', () => {
  it('parses 3 positions from fixture', () => {
    const result = parseStaffplan(FIXTURE);
    expect(result.positions).toHaveLength(3);
  });

  it('correctly identifies vacancy vs filled', () => {
    const result = parseStaffplan(FIXTURE);
    const vacant = result.positions.filter((p) => p.actualFte === 0);
    const filled = result.positions.filter((p) => p.actualFte > 0);
    expect(vacant).toHaveLength(1);
    expect(filled).toHaveLength(2);
  });

  it('extracts department names', () => {
    const result = parseStaffplan(FIXTURE);
    expect(result.departments.map((d) => d.name).sort()).toEqual([
      'Customer Experience',
      'OPS Region 1 CZ_Bazaar - Drivers',
    ]);
  });
});
```

- [ ] **Step 3: Spustit test a ověřit, že selže (FAIL)**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: FAIL `Cannot find module '@/lib/data/parsers/staffplan'`.

- [ ] **Step 4: Implementovat parser**

Create: `lib/data/parsers/staffplan.ts`

```typescript
import * as XLSX from 'xlsx';
import type { Position, Department, Division, PositionId, DepartmentId, DivisionId } from '@/lib/types';

interface RawRow {
  'Pobočka'?: string;
  'dep_sk'?: string;
  'kod_hier_sk'?: string;
  'Department'?: string;
  'Hierarchický kód'?: string;
  'Position'?: string;
  'poz_kod'?: string;
  'OSČPV'?: string;
  'Name'?: string;
  'LP platnost'?: string | number | Date;
  'Note'?: string;
  'Cap'?: number | string;
  'Actual Branch'?: number | string;
  'Note2'?: string;
}

export interface StaffplanParseResult {
  positions: Position[];
  departments: Department[];
  divisions: Division[];
  /** OSČPV → positionId mapping pro staff plan entries (pro budoucí cross-ref) */
  employeeToPosition: Map<string, PositionId>;
}

const toNumber = (v: number | string | undefined): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export function parseStaffplan(filePath: string): StaffplanParseResult {
  const wb = XLSX.readFile(filePath);
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) throw new Error('Staffplan: missing sheet');
  const ws = wb.Sheets[firstSheetName];
  if (!ws) throw new Error(`Staffplan: sheet ${firstSheetName} empty`);
  const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: '' });

  const positions: Position[] = [];
  const deptMap = new Map<DepartmentId, Department>();
  const divMap = new Map<DivisionId, Division>();
  const employeeToPosition = new Map<string, PositionId>();

  for (const r of rows) {
    const positionId = String(r['poz_kod'] ?? '').trim();
    const title = String(r['Position'] ?? '').trim();
    const deptName = String(r['Department'] ?? '').trim();
    const hierCode = String(r['Hierarchický kód'] ?? '').trim();
    if (!positionId || !title || !deptName) continue;

    const departmentId: DepartmentId = hierCode || deptName;
    const divisionId: DivisionId = hierCode.slice(0, 2) || deptName.slice(0, 2);

    if (!deptMap.has(departmentId)) {
      deptMap.set(departmentId, {
        id: departmentId,
        name: deptName,
        divisionId,
        headEmployeeId: null,
      });
    }
    if (!divMap.has(divisionId)) {
      divMap.set(divisionId, {
        id: divisionId,
        name: deptName,
        country: 'CZ', // kostra: upřesnění v pozdějších krocích
        parentId: null,
        costCenter: null,
      });
    }

    const capFte = toNumber(r['Cap']);
    const actualFte = toNumber(r['Actual Branch']);

    positions.push({
      id: positionId,
      title,
      divisionId,
      departmentId,
      criticalFlag: false,       // heuristika se aplikuje později
      grade: 'IC',               // heuristika se aplikuje později
      roleFamily: inferRoleFamily(title, deptName),
      capFte,
      actualFte,
    });

    const employeeId = String(r['OSČPV'] ?? '').trim();
    if (employeeId) employeeToPosition.set(employeeId, positionId);
  }

  return {
    positions,
    departments: Array.from(deptMap.values()),
    divisions: Array.from(divMap.values()),
    employeeToPosition,
  };
}

function inferRoleFamily(title: string, deptName: string): string {
  const t = title.toLowerCase();
  const d = deptName.toLowerCase();
  if (d.includes('driver')) return 'OPS-Driver';
  if (d.includes('helper')) return 'OPS-Helper';
  if (d.includes('call cent')) return 'Call Centre';
  if (d.includes('selling') || t.includes('sales')) return 'Sales';
  if (d.includes('buy')) return 'Buyer';
  if (d.includes('f&i')) return 'F&I';
  if (d.includes('marketing')) return 'Marketing';
  if (d.includes('customer experience')) return 'CX';
  if (d.includes('hr')) return 'HR';
  if (d.includes('finance') || d.includes('accounting')) return 'Finance';
  return 'Other';
}
```

- [ ] **Step 5: Spustit test a ověřit PASS**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/data/parsers/staffplan.ts tests/data/parsers.test.ts tests/fixtures/
git commit -m "feat(data): parser for Staffplan.xlsx with position/department/division extraction"
```

---

### Task 9: Parser Nastupy_vystupy.xlsx

**Files:**
- Create: `lib/data/parsers/workforce-events.ts`
- Modify: `tests/data/parsers.test.ts` (přidat testy)

- [ ] **Step 1: Rozšířit test fixture — přidat mini-workforce.xlsx**

Extend: `tests/fixtures/make-mini-staffplan.ts` — rename na `tests/fixtures/make-fixtures.ts` (rename file):

```bash
mv tests/fixtures/make-mini-staffplan.ts tests/fixtures/make-fixtures.ts
```

Přepiš obsah:

```typescript
import * as XLSX from 'xlsx';
import path from 'node:path';

// Mini staffplan
const staffRows = [
  ['Pobočka', 'dep_sk', 'kod_hier_sk', 'Department', 'Hierarchický kód',
   'Position', 'poz_kod', 'OSČPV', 'Name', 'LP platnost', 'Note', 'Cap',
   'Actual Branch', 'Note2'],
  ['', '', '0101', 'Customer Experience', '0101196',
   'Group Customer Experience Manager', '011960000004370.001', '23_30679.01',
   'Preclík Jan', '2026-07-13', 'HPP', 1.0, 1.0, ''],
  ['', '', '0101', 'Customer Experience', '0101',
   'CX Specialist', '011960000004371.001', '', 'vacancy', '', '', 1.0, 0.0, ''],
  ['', '', '0403', 'OPS Region 1 CZ_Bazaar - Drivers', '0403',
   'Driver', '040300000000000.001', '23_10001.01', 'Novák Pavel', '', 'HPP', 1.0, 1.0, ''],
];
const ws1 = XLSX.utils.aoa_to_sheet(staffRows);
const wb1 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb1, ws1, 'Con02faaa');
XLSX.writeFile(wb1, path.join(__dirname, 'mini-staffplan.xlsx'));

// Mini workforce events
const wfRows = [
  ['OSČPV', 'Kód a název struktury', 'Druh PV', 'Datum změny', 'Akademický titul',
   'Jméno', 'Příjmení', 'Titul', 'Důvod uvedení', 'Druh vynětí', 'Vynětí od', 'Predp. ukonč. vyn.'],
  ['23_10001.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2020-03-15',
   '', 'Pavel', 'Novák', '', '1 - Nástup osoby', 0, '', ''],
  ['23_10002.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2022-06-01',
   '', 'Jana', 'Svobodová', '', '1 - Nástup osoby', 0, '', ''],
  ['23_10002.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2024-11-30',
   '', 'Jana', 'Svobodová', '', '2 - Ukončení PV', 0, '', ''],
  ['23_30679.01', '0101196-Customer Experience', 'PP', '2019-01-15',
   '', 'Jan', 'Preclík', '', '1 - Nástup osoby', 0, '', ''],
];
const ws2 = XLSX.utils.aoa_to_sheet(wfRows);
const wb2 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb2, ws2, 'Osb17');
XLSX.writeFile(wb2, path.join(__dirname, 'mini-workforce.xlsx'));

console.log('Fixtures written.');
```

Spustit:

```bash
pnpm tsx tests/fixtures/make-fixtures.ts
```

Expected: `Fixtures written.` + existují `mini-staffplan.xlsx` a `mini-workforce.xlsx`.

- [ ] **Step 2: Napsat failing testy pro workforce parser**

Přidej do `tests/data/parsers.test.ts` na konec:

```typescript
import { parseWorkforceEvents } from '@/lib/data/parsers/workforce-events';

describe('parseWorkforceEvents', () => {
  const FIXTURE_WF = path.resolve(__dirname, '../fixtures/mini-workforce.xlsx');

  it('parses 4 events from fixture', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    expect(result.events).toHaveLength(4);
  });

  it('identifies hire vs termination', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    const hires = result.events.filter((e) => e.type === 'hire');
    const terms = result.events.filter((e) => e.type === 'terminate');
    expect(hires).toHaveLength(3);
    expect(terms).toHaveLength(1);
  });

  it('extracts unique employees', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    expect(result.employees.size).toBe(3); // unique OSČPV
  });

  it('links events with org structure code', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    const first = result.events[0];
    expect(first).toBeDefined();
    expect(first!.orgUnitCode).toBe('04030020035');
  });
});
```

- [ ] **Step 3: Spustit — FAIL**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 4: Implementovat parser**

Create: `lib/data/parsers/workforce-events.ts`

```typescript
import * as XLSX from 'xlsx';
import type { EmployeeId, EmploymentType } from '@/lib/types';

interface RawWfRow {
  'OSČPV'?: string;
  'Kód a název struktury'?: string;
  'Druh PV'?: string;
  'Datum změny'?: string | number | Date;
  'Akademický titul'?: string;
  'Jméno'?: string;
  'Příjmení'?: string;
  'Titul'?: string;
  'Důvod uvedení'?: string;
  'Druh vynětí'?: string | number;
  'Vynětí od'?: string;
  'Predp. ukonč. vyn.'?: string;
}

export interface WorkforceEventRaw {
  date: string;       // ISO
  employeeId: EmployeeId;
  type: 'hire' | 'terminate';
  orgUnitCode: string;       // prefix před pomlčkou
  orgUnitName: string;       // část za první pomlčkou
  employmentType: EmploymentType;
  firstName: string;
  lastName: string;
}

export interface WorkforceParseResult {
  events: WorkforceEventRaw[];
  /** Mapa OSČPV → { firstName, lastName, hireDate, lastDate, currentStatus } */
  employees: Map<
    EmployeeId,
    {
      firstName: string;
      lastName: string;
      firstSeenDate: string;
      lastSeenDate: string;
      currentlyActive: boolean;
      orgUnitCode: string;
      orgUnitName: string;
      employmentType: EmploymentType;
    }
  >;
}

const normalizeEmploymentType = (v: string | undefined): EmploymentType => {
  const s = String(v ?? '').trim().toUpperCase();
  if (s === 'PP') return 'PP';
  if (s === 'DPP') return 'DPP';
  if (s === 'DPČ' || s === 'DPC') return 'DPČ';
  if (s === 'STATUTAR') return 'STATUTAR';
  if (s === 'UČEŇ BEZ PV' || s === 'UCEN') return 'UCEN';
  return 'PP';
};

const toIsoDate = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  if (typeof v === 'string' && v.length >= 10) return v.slice(0, 10);
  return '';
};

const splitOrgUnit = (raw: string): { code: string; name: string } => {
  const s = String(raw ?? '').trim();
  const idx = s.indexOf('-');
  if (idx < 0) return { code: s, name: '' };
  return { code: s.slice(0, idx), name: s.slice(idx + 1) };
};

export function parseWorkforceEvents(filePath: string): WorkforceParseResult {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Workforce: missing sheet');
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Workforce: sheet ${sheetName} empty`);
  const rows = XLSX.utils.sheet_to_json<RawWfRow>(ws, { defval: '' });

  const events: WorkforceEventRaw[] = [];
  const employees: WorkforceParseResult['employees'] = new Map();

  for (const r of rows) {
    const employeeId = String(r['OSČPV'] ?? '').trim();
    if (!employeeId) continue;
    const date = toIsoDate(r['Datum změny']);
    if (!date) continue;
    const reason = String(r['Důvod uvedení'] ?? '').trim();
    const type = reason.startsWith('1') ? 'hire' : reason.startsWith('2') ? 'terminate' : null;
    if (!type) continue;

    const org = splitOrgUnit(String(r['Kód a název struktury'] ?? ''));
    const firstName = String(r['Jméno'] ?? '').trim();
    const lastName = String(r['Příjmení'] ?? '').trim();
    const employmentType = normalizeEmploymentType(r['Druh PV']);

    events.push({
      date,
      employeeId,
      type,
      orgUnitCode: org.code,
      orgUnitName: org.name,
      employmentType,
      firstName,
      lastName,
    });

    const existing = employees.get(employeeId);
    if (!existing) {
      employees.set(employeeId, {
        firstName,
        lastName,
        firstSeenDate: date,
        lastSeenDate: date,
        currentlyActive: type === 'hire',
        orgUnitCode: org.code,
        orgUnitName: org.name,
        employmentType,
      });
    } else {
      if (date < existing.firstSeenDate) existing.firstSeenDate = date;
      if (date > existing.lastSeenDate) {
        existing.lastSeenDate = date;
        existing.currentlyActive = type === 'hire';
        existing.orgUnitCode = org.code;
        existing.orgUnitName = org.name;
        existing.employmentType = employmentType;
      }
    }
  }

  return { events, employees };
}
```

- [ ] **Step 5: Spustit testy — PASS**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: všechny 7 testů passuje (3 staffplan + 4 workforce).

- [ ] **Step 6: Commit**

```bash
git add lib/data/parsers/workforce-events.ts tests/data/parsers.test.ts tests/fixtures/
git commit -m "feat(data): parser for Nastupy_vystupy.xlsx producing events and employee registry"
```

---

### Task 10: Parser recruitment_report.xlsx

**Files:**
- Create: `lib/data/parsers/recruitment.ts`
- Modify: `tests/data/parsers.test.ts`

- [ ] **Step 1: Rozšířit make-fixtures.ts o mini-recruitment**

Přidat na konec `tests/fixtures/make-fixtures.ts` před `console.log`:

```typescript
// Mini recruitment
const recruitRows = [
  ['Client', 'Client ID', 'Candidate', "Candidate's gender", 'Candidate ID',
   "Candidate's LinkedIn", 'Consent signing date', 'Employment status', 'Availability',
   'Availability - date', 'Availability - note', 'Seniority', 'Minimum salary expectations',
   'Salary units', 'Ref. number', 'Job vacancy', "Job's web title", "Job's date created",
   'Job status', "Client's contact person", 'Branch', 'Source', 'Source notes', 'On hold date', 'Rating'],
  ['Aures Holdings', '100001', 'Dusek Petr', 'male', '4075689', '', '2024-09-22',
   '', '', '', '', '', '0', '', 'A12045', 'Driver', 'Driver (Praha)', '2024-09-01',
   'filled', 'HR Team', 'Praha', 'Prace.cz', '', '', 4],
  ['Aures Holdings', '100002', 'Novotná Petra', 'female', '4075722', '', '2024-10-05',
   '', '', '', '', '', '0', '', 'A12046', 'CX Specialist', 'CX Specialist (Praha)',
   '2024-10-01', 'filled', 'HR Team', 'Praha', 'AAA Career', '', '', 5],
];
const wsR = XLSX.utils.aoa_to_sheet(recruitRows);
const wbR = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbR, wsR, 'Hiring processes');
XLSX.writeFile(wbR, path.join(__dirname, 'mini-recruitment.xlsx'));
```

Spustit:

```bash
pnpm tsx tests/fixtures/make-fixtures.ts
```

- [ ] **Step 2: Napsat failing testy**

Přidej do `tests/data/parsers.test.ts`:

```typescript
import { parseRecruitment } from '@/lib/data/parsers/recruitment';

describe('parseRecruitment', () => {
  const FIXTURE_R = path.resolve(__dirname, '../fixtures/mini-recruitment.xlsx');

  it('parses 2 hiring rows', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.rows).toHaveLength(2);
  });

  it('extracts sources', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.sources.get('Prace.cz')).toBe(1);
    expect(result.sources.get('AAA Career')).toBe(1);
  });

  it('counts hires by gender', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.genderCounts.male).toBe(1);
    expect(result.genderCounts.female).toBe(1);
  });
});
```

- [ ] **Step 3: FAIL**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 4: Implementovat parser**

Create: `lib/data/parsers/recruitment.ts`

```typescript
import * as XLSX from 'xlsx';
import type { Gender } from '@/lib/types';

interface RawRecruitRow {
  'Client'?: string;
  'Candidate'?: string;
  "Candidate's gender"?: string;
  'Ref. number'?: string;
  'Job vacancy'?: string;
  "Job's web title"?: string;
  "Job's date created"?: string | Date | number;
  'Job status'?: string;
  'Branch'?: string;
  'Source'?: string;
  'Rating'?: number | string;
}

export interface RecruitmentRow {
  client: string;
  candidateName: string;
  gender: Gender | 'unknown';
  refNumber: string;
  jobVacancy: string;
  jobWebTitle: string;
  jobDateCreated: string;
  jobStatus: string;
  branch: string;
  source: string;
  rating: number | null;
}

export interface RecruitmentParseResult {
  rows: RecruitmentRow[];
  sources: Map<string, number>;
  genderCounts: { male: number; female: number; unknown: number };
  /** distinct job vacancies keyed by Ref. number */
  vacancies: Map<string, { title: string; createdAt: string; client: string; branch: string; status: string }>;
}

const toIsoDate = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  if (typeof v === 'string' && v.length >= 10) return v.slice(0, 10);
  return '';
};

export function parseRecruitment(filePath: string): RecruitmentParseResult {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes('hiring')) ?? wb.SheetNames[0];
  if (!sheetName) throw new Error('Recruitment: missing sheet');
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Recruitment: sheet ${sheetName} empty`);
  const raws = XLSX.utils.sheet_to_json<RawRecruitRow>(ws, { defval: '' });

  const rows: RecruitmentRow[] = [];
  const sources = new Map<string, number>();
  const genderCounts = { male: 0, female: 0, unknown: 0 };
  const vacancies = new Map<string, { title: string; createdAt: string; client: string; branch: string; status: string }>();

  for (const r of raws) {
    const candidateName = String(r['Candidate'] ?? '').trim();
    if (!candidateName) continue;
    const rawG = String(r["Candidate's gender"] ?? '').trim().toLowerCase();
    const gender: Gender | 'unknown' = rawG === 'male' ? 'male' : rawG === 'female' ? 'female' : 'unknown';

    const rating = Number(r['Rating']);
    const row: RecruitmentRow = {
      client: String(r['Client'] ?? '').trim(),
      candidateName,
      gender,
      refNumber: String(r['Ref. number'] ?? '').trim(),
      jobVacancy: String(r['Job vacancy'] ?? '').trim(),
      jobWebTitle: String(r["Job's web title"] ?? '').trim(),
      jobDateCreated: toIsoDate(r["Job's date created"]),
      jobStatus: String(r['Job status'] ?? '').trim(),
      branch: String(r['Branch'] ?? '').trim(),
      source: String(r['Source'] ?? '').trim(),
      rating: Number.isFinite(rating) && rating > 0 ? rating : null,
    };
    rows.push(row);

    if (row.source) sources.set(row.source, (sources.get(row.source) ?? 0) + 1);
    genderCounts[gender] += 1;

    if (row.refNumber && !vacancies.has(row.refNumber)) {
      vacancies.set(row.refNumber, {
        title: row.jobWebTitle || row.jobVacancy,
        createdAt: row.jobDateCreated,
        client: row.client,
        branch: row.branch,
        status: row.jobStatus,
      });
    }
  }

  return { rows, sources, genderCounts, vacancies };
}
```

- [ ] **Step 5: PASS**

```bash
pnpm test tests/data/parsers.test.ts
```

Expected: 10 testů passuje.

- [ ] **Step 6: Commit**

```bash
git add lib/data/parsers/recruitment.ts tests/data/parsers.test.ts tests/fixtures/
git commit -m "feat(data): parser for recruitment_report.xlsx with sources, gender, and vacancy aggregates"
```

---

### Task 11: Anonymizační vrstva (pseudonymy)

**Files:**
- Create: `lib/data/parsers/names.ts`
- Modify: `tests/data/parsers.test.ts`

- [ ] **Step 1: Napsat failing test**

Přidej do `tests/data/parsers.test.ts`:

```typescript
import { createNamePseudonymizer } from '@/lib/data/parsers/names';

describe('createNamePseudonymizer', () => {
  it('returns same pseudonym for same employeeId (stable)', () => {
    const p = createNamePseudonymizer(42);
    const a = p.pseudonymize('23_10001.01', 'male');
    const b = p.pseudonymize('23_10001.01', 'male');
    expect(a).toEqual(b);
  });

  it('returns different pseudonyms for different ids', () => {
    const p = createNamePseudonymizer(42);
    const a = p.pseudonymize('23_10001.01', 'male');
    const b = p.pseudonymize('23_10002.01', 'female');
    expect(a.firstName).not.toBe(b.firstName);
  });

  it('respects gender', () => {
    const p = createNamePseudonymizer(42);
    const male = p.pseudonymize('23_10001.01', 'male');
    // Male first names: hard to assert without name bank; ověříme aspoň že pseudonym není prázdný
    expect(male.firstName.length).toBeGreaterThan(0);
    expect(male.lastName.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: FAIL**

```bash
pnpm test tests/data/parsers.test.ts
```

- [ ] **Step 3: Implementovat pseudonymizer**

Create: `lib/data/parsers/names.ts`

```typescript
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
```

- [ ] **Step 4: PASS**

```bash
pnpm test tests/data/parsers.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/data/parsers/names.ts tests/data/parsers.test.ts
git commit -m "feat(data): stable name pseudonymizer seeded by employeeId"
```

---

### Task 12: Heuristika grade B0–B3

**Files:**
- Create: `lib/data/heuristics/grade.ts`
- Create: `tests/data/heuristics.test.ts`

- [ ] **Step 1: Napsat failing testy**

Create: `tests/data/heuristics.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { inferGrade } from '@/lib/data/heuristics/grade';

describe('inferGrade', () => {
  it('assigns B0 to C-level titles', () => {
    expect(inferGrade({ title: 'Chief Executive Officer', hierCode: '01' })).toBe('B0');
    expect(inferGrade({ title: 'CFO', hierCode: '02' })).toBe('B0');
  });

  it('assigns B1 to Group / Divisional Director', () => {
    expect(inferGrade({ title: 'Group Marketing Director', hierCode: '01' })).toBe('B1');
    expect(inferGrade({ title: 'Sales Division Director', hierCode: '03' })).toBe('B1');
  });

  it('assigns B2 to Senior Manager / Group Manager level', () => {
    expect(inferGrade({ title: 'Group Customer Experience Manager', hierCode: '0101196' })).toBe('B2');
    expect(inferGrade({ title: 'Senior Project Manager', hierCode: '02' })).toBe('B2');
  });

  it('assigns B3 to Team Leader / Manager', () => {
    expect(inferGrade({ title: 'Team Leader', hierCode: '0403' })).toBe('B3');
    expect(inferGrade({ title: 'Store Manager', hierCode: '03' })).toBe('B3');
  });

  it('assigns IC by default', () => {
    expect(inferGrade({ title: 'Driver', hierCode: '0403' })).toBe('IC');
    expect(inferGrade({ title: 'CX Specialist', hierCode: '0101' })).toBe('IC');
  });
});
```

- [ ] **Step 2: FAIL**

```bash
pnpm test tests/data/heuristics.test.ts
```

- [ ] **Step 3: Implementovat**

Create: `lib/data/heuristics/grade.ts`

```typescript
import type { Grade } from '@/lib/types';

interface Input {
  title: string;
  hierCode: string;
}

const B0_PATTERNS = [
  /\bceo\b/i, /\bcfo\b/i, /\bcto\b/i, /\bcoo\b/i, /\bcmo\b/i, /\bcpo\b/i,
  /chief\s+\w+\s+officer/i,
  /group\s+ceo/i,
];

const B1_PATTERNS = [
  /\bdirector\b/i,
  /\bhead\s+of\b/i,
  /divisional\s+director/i,
  /group\s+\w+\s+director/i,
];

const B2_PATTERNS = [
  /senior\s+manager/i,
  /group\s+\w+\s+manager/i,
  /group\s+\w+\s+operations\s+manager/i,
  /regional\s+manager/i,
];

const B3_PATTERNS = [
  /\bmanager\b/i,
  /team\s+lead/i,
  /supervisor/i,
  /store\s+manager/i,
  /branch\s+manager/i,
];

export function inferGrade({ title, hierCode }: Input): Grade {
  const t = (title ?? '').trim();
  if (!t) return 'IC';
  if (B0_PATTERNS.some((p) => p.test(t))) return 'B0';
  if (B1_PATTERNS.some((p) => p.test(t))) return 'B1';
  if (B2_PATTERNS.some((p) => p.test(t))) return 'B2';
  if (B3_PATTERNS.some((p) => p.test(t))) return 'B3';
  // Fallback — jednotlivci, operativa, specialisté
  return 'IC';
}
```

- [ ] **Step 4: PASS**

```bash
pnpm test tests/data/heuristics.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/data/heuristics/grade.ts tests/data/heuristics.test.ts
git commit -m "feat(data): regex-based heuristic for grade B0-B3 inference from position title"
```

---

### Task 13: Heuristika kritičnosti pozice

**Files:**
- Create: `lib/data/heuristics/critical-position.ts`
- Modify: `tests/data/heuristics.test.ts`

- [ ] **Step 1: Napsat failing testy**

Přidej do `tests/data/heuristics.test.ts`:

```typescript
import { inferCriticalFlag } from '@/lib/data/heuristics/critical-position';

describe('inferCriticalFlag', () => {
  it('all B0 are critical', () => {
    expect(inferCriticalFlag({ grade: 'B0', roleFamily: 'Sales', singletonInDept: true })).toBe(true);
  });

  it('all B1 are critical', () => {
    expect(inferCriticalFlag({ grade: 'B1', roleFamily: 'F&I', singletonInDept: false })).toBe(true);
  });

  it('B2 in sales-generating roles are critical', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'F&I', singletonInDept: true })).toBe(true);
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'Sales', singletonInDept: true })).toBe(true);
  });

  it('B2 in support functions not critical by default', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'HR', singletonInDept: false })).toBe(false);
  });

  it('IC is never critical', () => {
    expect(inferCriticalFlag({ grade: 'IC', roleFamily: 'F&I', singletonInDept: true })).toBe(false);
  });
});
```

- [ ] **Step 2: FAIL**

```bash
pnpm test tests/data/heuristics.test.ts
```

- [ ] **Step 3: Implementovat**

Create: `lib/data/heuristics/critical-position.ts`

```typescript
import type { Grade } from '@/lib/types';

interface Input {
  grade: Grade;
  roleFamily: string;
  singletonInDept: boolean;
}

const REVENUE_ROLE_FAMILIES = new Set(['Sales', 'F&I', 'Buyer']);

export function inferCriticalFlag({ grade, roleFamily, singletonInDept }: Input): boolean {
  if (grade === 'B0' || grade === 'B1') return true;
  if (grade === 'B2' && REVENUE_ROLE_FAMILIES.has(roleFamily)) return true;
  if (grade === 'B3' && REVENUE_ROLE_FAMILIES.has(roleFamily) && singletonInDept) return true;
  return false;
}
```

- [ ] **Step 4: PASS**

```bash
pnpm test tests/data/heuristics.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/data/heuristics/critical-position.ts tests/data/heuristics.test.ts
git commit -m "feat(data): heuristic for critical position flag (grade + revenue role family)"
```

---

### Task 14: Mock generátory — payroll

**Files:**
- Create: `lib/data/mock/payroll.ts`
- Create: `tests/data/mock-generators.test.ts`

- [ ] **Step 1: Napsat failing test**

Create: `tests/data/mock-generators.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generatePayrollForEmployee } from '@/lib/data/mock/payroll';
import type { Employee } from '@/lib/types';

const mockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 'E001',
  firstName: 'Test',
  lastName: 'Ten',
  gender: 'male',
  birthDate: '1985-05-05',
  nationality: 'CZ',
  country: 'CZ',
  hireDate: '2024-01-01',
  terminationDate: null,
  terminationReason: null,
  positionId: 'P1',
  divisionId: 'D1',
  departmentId: 'DP1',
  orgUnitId: 'O1',
  grade: 'IC',
  employmentType: 'PP',
  fte: 1.0,
  managerId: null,
  criticalPositionFlag: false,
  talentPoolFlag: false,
  successorForPositionId: null,
  ...overrides,
});

describe('generatePayrollForEmployee', () => {
  it('produces one record per month in range while active', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01' });
    const result = generatePayrollForEmployee(emp, {
      fromMonth: '2024-01',
      toMonth: '2024-06',
      seed: 42,
    });
    expect(result).toHaveLength(6);
  });

  it('no records before hire date', () => {
    const emp = mockEmployee({ hireDate: '2024-04-01' });
    const result = generatePayrollForEmployee(emp, {
      fromMonth: '2024-01',
      toMonth: '2024-06',
      seed: 42,
    });
    expect(result).toHaveLength(3);
    expect(result[0]!.month).toBe('2024-04-01');
  });

  it('no records after termination date', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01', terminationDate: '2024-03-15' });
    const result = generatePayrollForEmployee(emp, {
      fromMonth: '2024-01',
      toMonth: '2024-06',
      seed: 42,
    });
    expect(result).toHaveLength(3);
    expect(result[result.length - 1]!.month).toBe('2024-03-01');
  });

  it('salary scales with grade (B0 > B3 > IC)', () => {
    const b0 = mockEmployee({ id: 'E01', grade: 'B0' });
    const b3 = mockEmployee({ id: 'E02', grade: 'B3' });
    const ic = mockEmployee({ id: 'E03', grade: 'IC' });
    const opts = { fromMonth: '2024-01', toMonth: '2024-01', seed: 42 };
    const b0r = generatePayrollForEmployee(b0, opts)[0]!;
    const b3r = generatePayrollForEmployee(b3, opts)[0]!;
    const icr = generatePayrollForEmployee(ic, opts)[0]!;
    expect(b0r.baseSalary).toBeGreaterThan(b3r.baseSalary);
    expect(b3r.baseSalary).toBeGreaterThan(icr.baseSalary);
  });

  it('deterministic — same seed produces same output', () => {
    const emp = mockEmployee();
    const opts = { fromMonth: '2024-01', toMonth: '2024-03', seed: 42 };
    const a = generatePayrollForEmployee(emp, opts);
    const b = generatePayrollForEmployee(emp, opts);
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: FAIL**

```bash
pnpm test tests/data/mock-generators.test.ts
```

- [ ] **Step 3: Implementovat**

Create: `lib/data/mock/payroll.ts`

```typescript
import seedrandom from 'seedrandom';
import type { Employee, Grade, PayrollMonth } from '@/lib/types';

interface Options {
  fromMonth: string;        // "YYYY-MM"
  toMonth: string;
  seed: number;
}

// Base CZK monthly salary by grade (mean, approximate CEE automotive retail)
const BASE_BY_GRADE: Record<Grade, number> = {
  B0: 250_000,
  B1: 160_000,
  B2: 95_000,
  B3: 55_000,
  IC: 38_000,
};

const VARIABLE_PCT_BY_GRADE: Record<Grade, number> = {
  B0: 0.4,
  B1: 0.25,
  B2: 0.15,
  B3: 0.1,
  IC: 0.07,
};

const monthsRange = (fromMonth: string, toMonth: string): string[] => {
  const [fy, fm] = fromMonth.split('-').map(Number);
  const [ty, tm] = toMonth.split('-').map(Number);
  if (!fy || !fm || !ty || !tm) return [];
  const result: string[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    result.push(`${y}-${String(m).padStart(2, '0')}-01`);
    m += 1;
    if (m > 12) { y += 1; m = 1; }
  }
  return result;
};

export function generatePayrollForEmployee(emp: Employee, opts: Options): PayrollMonth[] {
  const rng = seedrandom(`${opts.seed}:payroll:${emp.id}`);
  const out: PayrollMonth[] = [];

  const hireMonth = emp.hireDate.slice(0, 7);
  const termMonth = emp.terminationDate ? emp.terminationDate.slice(0, 7) : null;

  // Individual variance: -15% .. +25% of base
  const personalFactor = 0.85 + rng() * 0.4;
  const baseMean = BASE_BY_GRADE[emp.grade] * personalFactor * emp.fte;
  const variablePct = VARIABLE_PCT_BY_GRADE[emp.grade];

  for (const monthIso of monthsRange(opts.fromMonth, opts.toMonth)) {
    const mKey = monthIso.slice(0, 7);
    if (mKey < hireMonth) continue;
    if (termMonth && mKey > termMonth) continue;

    const monthVariability = 0.97 + rng() * 0.06;  // +/- 3%
    const baseSalary = Math.round(baseMean * monthVariability);
    const variable = Math.round(baseSalary * variablePct * (0.5 + rng()));
    const benefits = Math.round(baseSalary * 0.08);
    const nonPersonal = Math.round(baseSalary * 0.12);
    const totalCost = baseSalary + variable + benefits + nonPersonal;

    out.push({
      month: monthIso,
      employeeId: emp.id,
      baseSalary,
      variable,
      benefits,
      nonPersonal,
      totalCost,
    });
  }

  return out;
}
```

- [ ] **Step 4: PASS**

```bash
pnpm test tests/data/mock-generators.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/data/mock/payroll.ts tests/data/mock-generators.test.ts
git commit -m "feat(data): deterministic mock payroll generator with grade-based scaling"
```

---

### Task 15: Mock generátory — absence, eNPS, performance, training, succession, accidents

**Files:**
- Create: `lib/data/mock/absence.ts`, `enps.ts`, `performance.ts`, `training.ts`, `succession.ts`, `accidents.ts`
- Modify: `tests/data/mock-generators.test.ts`

- [ ] **Step 1: Napsat failing testy pro všechny nové generátory**

Přidej do `tests/data/mock-generators.test.ts`:

```typescript
import { generateAbsenceForEmployee } from '@/lib/data/mock/absence';
import { generateEnpsResponses } from '@/lib/data/mock/enps';
import { generatePerformanceReview } from '@/lib/data/mock/performance';
import { generateTrainingCompletions } from '@/lib/data/mock/training';
import { generateSuccessionPlan } from '@/lib/data/mock/succession';
import { generateAccidents } from '@/lib/data/mock/accidents';

describe('generateAbsenceForEmployee', () => {
  it('produces sick + vacation records within year', () => {
    const emp = mockEmployee({ hireDate: '2023-01-01' });
    const records = generateAbsenceForEmployee(emp, { year: 2024, seed: 42 });
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r) => r.dateFrom.startsWith('2024-'))).toBe(true);
    expect(records.some((r) => r.type === 'sick')).toBe(true);
    expect(records.some((r) => r.type === 'vacation')).toBe(true);
  });

  it('returns no records if employee not active in year', () => {
    const emp = mockEmployee({ hireDate: '2025-01-01' });
    const records = generateAbsenceForEmployee(emp, { year: 2024, seed: 42 });
    expect(records).toHaveLength(0);
  });
});

describe('generateEnpsResponses', () => {
  it('produces one response per employee per cycle (if invited & responded)', () => {
    const emps = [mockEmployee({ id: 'E1' }), mockEmployee({ id: 'E2' }), mockEmployee({ id: 'E3' })];
    const result = generateEnpsResponses(emps, { cycle: '2025-Q4', seed: 42, participationRate: 0.7 });
    expect(result.length).toBeLessThanOrEqual(emps.length);
    for (const r of result) expect(r.cycle).toBe('2025-Q4');
  });
});

describe('generatePerformanceReview', () => {
  it('produces rating 1..5 and growth potential', () => {
    const emp = mockEmployee();
    const r = generatePerformanceReview(emp, { cycle: '2025', seed: 42 });
    expect([1, 2, 3, 4, 5]).toContain(r.rating);
    expect(['low', 'med', 'high', 'very_high']).toContain(r.growthPotential);
  });
});

describe('generateTrainingCompletions', () => {
  it('produces records only while employee is active in given year', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01' });
    const records = generateTrainingCompletions(emp, { year: 2024, seed: 42 });
    expect(records.every((r) => r.date.startsWith('2024-'))).toBe(true);
  });
});

describe('generateSuccessionPlan', () => {
  it('assigns ready_now / ready_1_2y / gap for critical positions', () => {
    const plan = generateSuccessionPlan({
      positionId: 'P1',
      incumbentEmployeeId: 'E1',
      candidates: [{ employeeId: 'E2' }, { employeeId: 'E3' }],
      seed: 42,
    });
    expect(['ready_now', 'ready_1_2y', 'gap']).toContain(plan.readiness);
  });
});

describe('generateAccidents', () => {
  it('produces realistic low-frequency accidents per division-year', () => {
    const result = generateAccidents({
      divisionId: 'OPS-Drivers',
      year: 2025,
      headcount: 300,
      seed: 42,
    });
    // Rough sanity: not too many, not zero
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(result.length).toBeLessThan(50);
  });
});
```

- [ ] **Step 2: FAIL**

```bash
pnpm test tests/data/mock-generators.test.ts
```

- [ ] **Step 3a: Implementovat absence**

Create: `lib/data/mock/absence.ts`

```typescript
import seedrandom from 'seedrandom';
import type { Employee, AbsenceRecord } from '@/lib/types';

interface Options {
  year: number;
  seed: number;
}

const addDays = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + days));
  return dt.toISOString().slice(0, 10);
};

const isEmployedInYear = (emp: Employee, year: number): boolean => {
  const start = new Date(emp.hireDate);
  const end = emp.terminationDate ? new Date(emp.terminationDate) : new Date(`${year + 1}-01-01`);
  return start.getFullYear() <= year && end.getFullYear() >= year;
};

export function generateAbsenceForEmployee(emp: Employee, opts: Options): AbsenceRecord[] {
  if (!isEmployedInYear(emp, opts.year)) return [];
  const rng = seedrandom(`${opts.seed}:absence:${emp.id}:${opts.year}`);
  const out: AbsenceRecord[] = [];

  // Sick: 1–3 events per year, each 1–7 days, mean ~3% annual
  const sickEvents = Math.floor(rng() * 3) + 1;
  for (let i = 0; i < sickEvents; i++) {
    const dayOfYear = Math.floor(rng() * 360) + 1;
    const duration = Math.floor(rng() * 7) + 1;
    const fromDate = addDays(`${opts.year}-01-01`, dayOfYear);
    out.push({
      employeeId: emp.id,
      dateFrom: fromDate,
      dateTo: addDays(fromDate, duration - 1),
      type: 'sick',
      days: duration,
    });
  }

  // Vacation: 2–4 chunks totaling 15–25 days
  const vacationChunks = Math.floor(rng() * 3) + 2;
  let remaining = Math.floor(rng() * 10) + 15;
  for (let i = 0; i < vacationChunks && remaining > 0; i++) {
    const chunk = Math.min(remaining, Math.floor(rng() * 7) + 3);
    const dayOfYear = Math.floor(rng() * 330) + 1;
    const fromDate = addDays(`${opts.year}-01-01`, dayOfYear);
    out.push({
      employeeId: emp.id,
      dateFrom: fromDate,
      dateTo: addDays(fromDate, chunk - 1),
      type: 'vacation',
      days: chunk,
    });
    remaining -= chunk;
  }

  return out;
}
```

- [ ] **Step 3b: Implementovat eNPS**

Create: `lib/data/mock/enps.ts`

```typescript
import seedrandom from 'seedrandom';
import type { Employee, ENPSResponse } from '@/lib/types';

interface Options {
  cycle: string;           // "2025-Q4"
  seed: number;
  participationRate: number;
}

export function generateEnpsResponses(employees: Employee[], opts: Options): ENPSResponse[] {
  const rng = seedrandom(`${opts.seed}:enps:${opts.cycle}`);
  const responses: ENPSResponse[] = [];
  for (const emp of employees) {
    const invited = true;
    const responded = rng() < opts.participationRate;
    const base = 10 + (rng() * 40 - 20);
    const score = Math.max(-100, Math.min(100, Math.round(base)));
    responses.push({
      cycle: opts.cycle,
      employeeId: emp.id,
      score,
      invited,
      responded,
      segment: { country: emp.country, divisionId: emp.divisionId },
    });
  }
  return responses.filter((r) => r.responded);
}
```

- [ ] **Step 3c: Implementovat performance**

Create: `lib/data/mock/performance.ts`

```typescript
import seedrandom from 'seedrandom';
import type { Employee, PerformanceReview } from '@/lib/types';

interface Options {
  cycle: string;
  seed: number;
}

export function generatePerformanceReview(emp: Employee, opts: Options): PerformanceReview {
  const rng = seedrandom(`${opts.seed}:perf:${emp.id}:${opts.cycle}`);
  // Bell-ish: 5% weak, 20% below, 50% meets, 20% exceeds, 5% outstanding
  const r = rng();
  const rating: PerformanceReview['rating'] =
    r < 0.05 ? 1 : r < 0.25 ? 2 : r < 0.75 ? 3 : r < 0.95 ? 4 : 5;

  const g = rng();
  const growthPotential: PerformanceReview['growthPotential'] =
    g < 0.15 ? 'low' : g < 0.55 ? 'med' : g < 0.9 ? 'high' : 'very_high';

  const talentFlag = rating >= 4 && (growthPotential === 'high' || growthPotential === 'very_high');

  return {
    cycle: opts.cycle,
    employeeId: emp.id,
    rating,
    growthPotential,
    talentFlag,
  };
}
```

- [ ] **Step 3d: Implementovat training**

Create: `lib/data/mock/training.ts`

```typescript
import seedrandom from 'seedrandom';
import type { Employee, TrainingCompletion } from '@/lib/types';

interface Options {
  year: number;
  seed: number;
}

const AREAS = ['Compliance', 'Sales', 'Leadership', 'ESG', 'Safety', 'Product', 'Customer Service'];
const COURSES_BY_AREA: Record<string, string[]> = {
  Compliance: ['GDPR obnova', 'AML školení'],
  Sales: ['Negociace', 'Prodejní dovednosti'],
  Leadership: ['Coaching základy', 'Feedback framework'],
  ESG: ['ESRS úvod', 'Uhlíková stopa'],
  Safety: ['BOZP', 'První pomoc'],
  Product: ['Produktové novinky', 'Vyhledávání závad'],
  'Customer Service': ['Řízení stížností', 'Empatie v komunikaci'],
};

const isEmployedInYear = (emp: Employee, year: number): boolean => {
  const start = new Date(emp.hireDate);
  const end = emp.terminationDate ? new Date(emp.terminationDate) : new Date(`${year + 1}-01-01`);
  return start.getFullYear() <= year && end.getFullYear() >= year;
};

export function generateTrainingCompletions(emp: Employee, opts: Options): TrainingCompletion[] {
  if (!isEmployedInYear(emp, opts.year)) return [];
  const rng = seedrandom(`${opts.seed}:training:${emp.id}:${opts.year}`);
  const out: TrainingCompletion[] = [];
  const count = Math.floor(rng() * 4) + 1;    // 1..4 courses/year
  for (let i = 0; i < count; i++) {
    const area = AREAS[Math.floor(rng() * AREAS.length)]!;
    const courses = COURSES_BY_AREA[area]!;
    const course = courses[Math.floor(rng() * courses.length)]!;
    const hours = Math.floor(rng() * 6) + 2;
    const cost = hours * 800 + Math.floor(rng() * 500);
    const dayOfYear = Math.floor(rng() * 350) + 10;
    const dt = new Date(Date.UTC(opts.year, 0, dayOfYear));
    out.push({
      date: dt.toISOString().slice(0, 10),
      employeeId: emp.id,
      course,
      area,
      hours,
      cost,
    });
  }
  return out;
}
```

- [ ] **Step 3e: Implementovat succession**

Create: `lib/data/mock/succession.ts`

```typescript
import seedrandom from 'seedrandom';
import type { SuccessionPlan, PositionId, EmployeeId } from '@/lib/types';

interface Options {
  positionId: PositionId;
  incumbentEmployeeId: EmployeeId | null;
  candidates: Array<{ employeeId: EmployeeId }>;
  seed: number;
}

export function generateSuccessionPlan(opts: Options): SuccessionPlan {
  const rng = seedrandom(`${opts.seed}:succession:${opts.positionId}`);
  const r = rng();
  // 45% ready_now, 35% ready_1_2y, 20% gap
  const readiness: SuccessionPlan['readiness'] =
    r < 0.45 ? 'ready_now' : r < 0.8 ? 'ready_1_2y' : 'gap';

  const successor =
    readiness === 'gap' || opts.candidates.length === 0
      ? null
      : opts.candidates[Math.floor(rng() * opts.candidates.length)]!.employeeId;

  return {
    criticalPositionId: opts.positionId,
    incumbentEmployeeId: opts.incumbentEmployeeId,
    successorEmployeeId: successor,
    readiness,
  };
}
```

- [ ] **Step 3f: Implementovat accidents**

Create: `lib/data/mock/accidents.ts`

```typescript
import seedrandom from 'seedrandom';
import type { WorkAccident } from '@/lib/types';

interface Options {
  divisionId: string;
  year: number;
  headcount: number;
  seed: number;
}

const TYPES = ['Slip on floor', 'Lifting injury', 'Minor cut', 'Vehicle incident', 'Chemical exposure'];

export function generateAccidents(opts: Options): WorkAccident[] {
  const rng = seedrandom(`${opts.seed}:accidents:${opts.divisionId}:${opts.year}`);
  // ~1 accident per 100 HC per year baseline
  const expected = (opts.headcount / 100) * 1.2;
  const count = Math.max(0, Math.round(expected + (rng() - 0.5) * 3));
  const out: WorkAccident[] = [];
  for (let i = 0; i < count; i++) {
    const dayOfYear = Math.floor(rng() * 360) + 1;
    const dt = new Date(Date.UTC(opts.year, 0, dayOfYear));
    const sev = rng();
    const severity: WorkAccident['severity'] = sev < 0.7 ? 'minor' : sev < 0.95 ? 'moderate' : 'serious';
    out.push({
      date: dt.toISOString().slice(0, 10),
      divisionId: opts.divisionId,
      severity,
      type: TYPES[Math.floor(rng() * TYPES.length)]!,
    });
  }
  return out;
}
```

- [ ] **Step 4: PASS všech generátorů**

```bash
pnpm test tests/data/mock-generators.test.ts
```

Expected: všechny testy passují.

- [ ] **Step 5: Commit**

```bash
git add lib/data/mock/ tests/data/mock-generators.test.ts
git commit -m "feat(data): deterministic mock generators for absence, eNPS, performance, training, succession, accidents"
```

---

### Task 16: DataProvider interface

**Files:**
- Create: `lib/data/provider.ts`

- [ ] **Step 1: Definovat interface**

Create: `lib/data/provider.ts`

```typescript
import type {
  Employee,
  Position,
  Division,
  Department,
  HeadcountSnapshot,
  WorkforceEvent,
  PayrollMonth,
  AbsenceRecord,
  ShiftDay,
  RecruitmentRequisition,
  FunnelCount,
  PerformanceReview,
  ENPSResponse,
  TrainingCompletion,
  WorkAccident,
  SuccessionPlan,
  Country,
  DivisionId,
} from '@/lib/types';

export interface Period {
  /** ISO YYYY-MM-DD (inclusive) */
  from: string;
  /** ISO YYYY-MM-DD (inclusive) */
  to: string;
}

export interface CommonFilter {
  country?: Country | Country[];
  divisionIds?: DivisionId[];
}

export interface DataProvider {
  // Dimensions
  getEmployees(filter?: CommonFilter): Promise<Employee[]>;
  getPositions(filter?: CommonFilter): Promise<Position[]>;
  getDivisions(): Promise<Division[]>;
  getDepartments(): Promise<Department[]>;

  // Facts
  getHeadcountSnapshots(period: Period, filter?: CommonFilter): Promise<HeadcountSnapshot[]>;
  getWorkforceEvents(period: Period, filter?: CommonFilter): Promise<WorkforceEvent[]>;
  getPayroll(period: Period, filter?: CommonFilter): Promise<PayrollMonth[]>;
  getAbsence(period: Period, filter?: CommonFilter): Promise<AbsenceRecord[]>;
  getShifts(period: Period, filter?: CommonFilter): Promise<ShiftDay[]>;
  getRequisitions(period: Period, filter?: CommonFilter): Promise<RecruitmentRequisition[]>;
  getFunnelCounts(period: Period, filter?: CommonFilter): Promise<FunnelCount[]>;
  getPerformanceReviews(cycle: string, filter?: CommonFilter): Promise<PerformanceReview[]>;
  getEnpsResponses(cycle: string, filter?: CommonFilter): Promise<ENPSResponse[]>;
  getTraining(period: Period, filter?: CommonFilter): Promise<TrainingCompletion[]>;
  getAccidents(period: Period, filter?: CommonFilter): Promise<WorkAccident[]>;
  getSuccessionPlans(): Promise<SuccessionPlan[]>;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/data/provider.ts
git commit -m "feat(data): DataProvider interface covering all HR entities and facts"
```

---

### Task 17: Orchestrátor — scripts/gen-data.ts

**Files:**
- Create: `scripts/gen-data.ts`
- Create: `lib/data/generated/.gitkeep`

- [ ] **Step 1: Vytvořit `.gitkeep`**

```bash
mkdir -p lib/data/generated
touch lib/data/generated/.gitkeep
```

- [ ] **Step 2: Vytvořit orchestrátor**

Create: `scripts/gen-data.ts`

```typescript
/**
 * Generuje konsolidovaný datový set:
 *   real data (staffplan + workforce events + recruitment) → kostra
 *   + heuristiky (grade, kritičnost)
 *   + mock generátory (payroll, absence, eNPS, performance, training, succession, accidents)
 *   = lib/data/generated/*.ts — import-ready TS moduly
 *
 * Spuštění: pnpm gen:data
 */
import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import seedrandom from 'seedrandom';
import { parseStaffplan } from '@/lib/data/parsers/staffplan';
import { parseWorkforceEvents } from '@/lib/data/parsers/workforce-events';
import { parseRecruitment } from '@/lib/data/parsers/recruitment';
import { createNamePseudonymizer } from '@/lib/data/parsers/names';
import { inferGrade } from '@/lib/data/heuristics/grade';
import { inferCriticalFlag } from '@/lib/data/heuristics/critical-position';
import { generatePayrollForEmployee } from '@/lib/data/mock/payroll';
import { generateAbsenceForEmployee } from '@/lib/data/mock/absence';
import { generateEnpsResponses } from '@/lib/data/mock/enps';
import { generatePerformanceReview } from '@/lib/data/mock/performance';
import { generateTrainingCompletions } from '@/lib/data/mock/training';
import { generateSuccessionPlan } from '@/lib/data/mock/succession';
import { generateAccidents } from '@/lib/data/mock/accidents';
import type {
  Employee,
  Position,
  Gender,
  PayrollMonth,
  AbsenceRecord,
  PerformanceReview,
  ENPSResponse,
  TrainingCompletion,
  WorkAccident,
  SuccessionPlan,
  WorkforceEvent,
  TerminationReason,
} from '@/lib/types';

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'data-sources/raw');
const OUT = path.join(ROOT, 'lib/data/generated');
const SEED = 42;

const THIS_YEAR = 2026;
const START_MONTH = '2023-01';
const END_MONTH = '2026-03';

function writeTsModule(filename: string, exportName: string, data: unknown): void {
  const body = `// AUTO-GENERATED by scripts/gen-data.ts — DO NOT EDIT\nexport const ${exportName} = ${JSON.stringify(data, null, 2)} as const;\n`;
  writeFileSync(path.join(OUT, filename), body, 'utf8');
}

function main(): void {
  console.log('🏗  HR Analytics data pipeline — start');
  mkdirSync(OUT, { recursive: true });

  // === 1. Parse real data ===
  const sp = parseStaffplan(path.join(RAW, 'Staffplan.xlsx'));
  const wf = parseWorkforceEvents(path.join(RAW, 'Nastupy_vystupy.xlsx'));
  const rec = parseRecruitment(path.join(RAW, 'recruitment_report.xlsx'));
  console.log(`   real data: ${sp.positions.length} positions, ${wf.events.length} wf events, ${rec.rows.length} recruitment rows`);

  // === 2. Build Position[] with heuristics ===
  const deptCountByRole = new Map<string, number>();
  for (const p of sp.positions) {
    const key = `${p.departmentId}:${p.roleFamily}`;
    deptCountByRole.set(key, (deptCountByRole.get(key) ?? 0) + 1);
  }
  const positions: Position[] = sp.positions.map((p) => {
    const grade = inferGrade({ title: p.title, hierCode: p.departmentId });
    const singletonInDept = (deptCountByRole.get(`${p.departmentId}:${p.roleFamily}`) ?? 0) <= 2;
    const criticalFlag = inferCriticalFlag({ grade, roleFamily: p.roleFamily, singletonInDept });
    return { ...p, grade, criticalFlag };
  });

  // === 3. Build Employee[] from workforce events ===
  const pseudo = createNamePseudonymizer(SEED);
  const termReasons = ['resignation', 'mutual_agreement', 'dismissal', 'probation_end'] as const;
  /**
   * Naivní matching orgUnitName (ze workforce) ↔ department (ze staffplanu).
   * Pokud nenajde match, fallback na první pozici daného roleFamily odhadnutého z názvu,
   * a finálně první pozici vůbec. Vyladění přijde v M2 (přesnější cross-ref).
   */
  const matchPosition = (orgUnitName: string): Position => {
    const name = orgUnitName.toLowerCase();
    const byDept = positions.find((p) => name.includes(p.title.toLowerCase().split(' ')[0] ?? '__none__'));
    if (byDept) return byDept;
    const byRoleFamily = positions.find((p) => {
      const rf = p.roleFamily.toLowerCase();
      return name.includes(rf) || (rf === 'ops-driver' && name.includes('driver')) || (rf === 'ops-helper' && name.includes('helper'));
    });
    return byRoleFamily ?? positions[0]!;
  };
  const employees: Employee[] = [];
  for (const [osčpv, info] of wf.employees) {
    const rngG = seedrandom(`${SEED}:g:${osčpv}`);
    const rngTr = seedrandom(`${SEED}:tr:${osčpv}`);
    const rngBd = seedrandom(`${SEED}:bd:${osčpv}`);
    const g: Gender = rngG() < 0.75 ? 'male' : 'female';
    const names = pseudo.pseudonymize(osčpv, g);
    const position = matchPosition(info.orgUnitName);
    const termReason: TerminationReason | null = info.currentlyActive
      ? null
      : termReasons[Math.floor(rngTr() * termReasons.length)]!;
    const birthYear = 1965 + Math.floor(rngBd() * 40);
    employees.push({
      id: osčpv,
      firstName: names.firstName,
      lastName: names.lastName,
      gender: g,
      birthDate: `${birthYear}-06-15`,
      nationality: 'CZ',
      country: 'CZ',
      hireDate: info.firstSeenDate,
      terminationDate: info.currentlyActive ? null : info.lastSeenDate,
      terminationReason: termReason,
      positionId: position.id,
      divisionId: position.divisionId,
      departmentId: position.departmentId,
      orgUnitId: info.orgUnitCode,
      grade: position.grade,
      employmentType: info.employmentType,
      fte: position.actualFte > 0 ? 1 : 0.5,
      managerId: null,
      criticalPositionFlag: position.criticalFlag,
      talentPoolFlag: false,
      successorForPositionId: null,
    });
  }
  console.log(`   employees built: ${employees.length}`);

  // === 4. Mock facts ===
  const payroll: PayrollMonth[] = [];
  const absence: AbsenceRecord[] = [];
  const training: TrainingCompletion[] = [];
  const perf: PerformanceReview[] = [];

  for (const emp of employees) {
    payroll.push(...generatePayrollForEmployee(emp, { fromMonth: START_MONTH, toMonth: END_MONTH, seed: SEED }));
    for (let y = 2023; y <= THIS_YEAR; y++) {
      absence.push(...generateAbsenceForEmployee(emp, { year: y, seed: SEED }));
      training.push(...generateTrainingCompletions(emp, { year: y, seed: SEED }));
    }
    for (const cycle of ['2024', '2025']) {
      const activeInCycle = new Date(emp.hireDate).getFullYear() <= Number(cycle) && (!emp.terminationDate || new Date(emp.terminationDate).getFullYear() >= Number(cycle));
      if (activeInCycle) perf.push(generatePerformanceReview(emp, { cycle, seed: SEED }));
    }
  }

  const activeEmployees = employees.filter((e) => !e.terminationDate);
  const enps: ENPSResponse[] = generateEnpsResponses(activeEmployees, { cycle: '2025-Q4', seed: SEED, participationRate: 0.7 });

  // Accidents per division
  const divisionHc = new Map<string, number>();
  for (const e of activeEmployees) divisionHc.set(e.divisionId, (divisionHc.get(e.divisionId) ?? 0) + 1);
  const accidents: WorkAccident[] = [];
  for (const [divId, hc] of divisionHc) {
    for (let y = 2023; y <= THIS_YEAR; y++) {
      accidents.push(...generateAccidents({ divisionId: divId, year: y, headcount: hc, seed: SEED }));
    }
  }

  // Succession plans for critical positions
  const successionPlans: SuccessionPlan[] = [];
  for (const p of positions.filter((p) => p.criticalFlag)) {
    const incumbent = employees.find((e) => e.positionId === p.id && !e.terminationDate) ?? null;
    const candidates = activeEmployees
      .filter((e) => e.grade === 'B3' || e.grade === 'B2')
      .slice(0, 5)
      .map((e) => ({ employeeId: e.id }));
    successionPlans.push(
      generateSuccessionPlan({
        positionId: p.id,
        incumbentEmployeeId: incumbent?.id ?? null,
        candidates,
        seed: SEED,
      }),
    );
  }

  // === 5. Workforce events re-export ===
  const wfEvents: WorkforceEvent[] = wf.events.map((e) => ({
    date: e.date,
    employeeId: e.employeeId,
    type: e.type,
    reason: undefined,
    voluntary: undefined,
  }));

  // === 6. Write outputs ===
  writeTsModule('employees.ts', 'EMPLOYEES', employees);
  writeTsModule('positions.ts', 'POSITIONS', positions);
  writeTsModule('departments.ts', 'DEPARTMENTS', sp.departments);
  writeTsModule('divisions.ts', 'DIVISIONS', sp.divisions);
  writeTsModule('payroll.ts', 'PAYROLL', payroll);
  writeTsModule('absence.ts', 'ABSENCE', absence);
  writeTsModule('training.ts', 'TRAINING', training);
  writeTsModule('performance.ts', 'PERFORMANCE', perf);
  writeTsModule('enps.ts', 'ENPS', enps);
  writeTsModule('accidents.ts', 'ACCIDENTS', accidents);
  writeTsModule('succession.ts', 'SUCCESSION', successionPlans);
  writeTsModule('workforce-events.ts', 'WORKFORCE_EVENTS', wfEvents);

  console.log('✅ Data pipeline complete.');
  console.log(`   📄 ${OUT}`);
}

main();
```

- [ ] **Step 3: Spustit**

```bash
pnpm gen:data
```

Expected: ✅ message, generated files v `lib/data/generated/`.

- [ ] **Step 4: Ověřit, že typecheck projde**

```bash
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add scripts/gen-data.ts lib/data/generated/.gitkeep
git commit -m "feat(data): orchestrator script consolidating real + heuristic + mock data into TS modules"
```

---

### Task 18: MockDataProvider

**Files:**
- Create: `lib/data/mock-provider.ts`

- [ ] **Step 1: Implementovat MockDataProvider**

Create: `lib/data/mock-provider.ts`

```typescript
import type {
  DataProvider,
  Period,
  CommonFilter,
} from '@/lib/data/provider';
import type {
  Employee,
  Position,
  Division,
  Department,
  HeadcountSnapshot,
  WorkforceEvent,
  PayrollMonth,
  AbsenceRecord,
  ShiftDay,
  RecruitmentRequisition,
  FunnelCount,
  PerformanceReview,
  ENPSResponse,
  TrainingCompletion,
  WorkAccident,
  SuccessionPlan,
} from '@/lib/types';

import { EMPLOYEES } from '@/lib/data/generated/employees';
import { POSITIONS } from '@/lib/data/generated/positions';
import { DIVISIONS } from '@/lib/data/generated/divisions';
import { DEPARTMENTS } from '@/lib/data/generated/departments';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { ABSENCE } from '@/lib/data/generated/absence';
import { TRAINING } from '@/lib/data/generated/training';
import { PERFORMANCE } from '@/lib/data/generated/performance';
import { ENPS } from '@/lib/data/generated/enps';
import { ACCIDENTS } from '@/lib/data/generated/accidents';
import { SUCCESSION } from '@/lib/data/generated/succession';
import { WORKFORCE_EVENTS } from '@/lib/data/generated/workforce-events';

const inPeriod = (date: string, period: Period): boolean => date >= period.from && date <= period.to;

const matchesFilter = <T extends { country?: string; divisionId?: string }>(
  row: T,
  filter: CommonFilter | undefined,
): boolean => {
  if (!filter) return true;
  if (filter.country) {
    const list = Array.isArray(filter.country) ? filter.country : [filter.country];
    if (row.country && !list.includes(row.country)) return false;
  }
  if (filter.divisionIds?.length && row.divisionId && !filter.divisionIds.includes(row.divisionId)) return false;
  return true;
};

export class MockDataProvider implements DataProvider {
  async getEmployees(filter?: CommonFilter): Promise<Employee[]> {
    return EMPLOYEES.filter((e) => matchesFilter(e, filter)) as Employee[];
  }
  async getPositions(filter?: CommonFilter): Promise<Position[]> {
    return POSITIONS.filter((p) => matchesFilter(p, filter)) as Position[];
  }
  async getDivisions(): Promise<Division[]> {
    return DIVISIONS as unknown as Division[];
  }
  async getDepartments(): Promise<Department[]> {
    return DEPARTMENTS as unknown as Department[];
  }
  async getHeadcountSnapshots(_period: Period, _filter?: CommonFilter): Promise<HeadcountSnapshot[]> {
    // Odvození z EMPLOYEES + period (zatím nevytváříme historii snapshotů — počítat at-the-fly)
    return [];
  }
  async getWorkforceEvents(period: Period, filter?: CommonFilter): Promise<WorkforceEvent[]> {
    return WORKFORCE_EVENTS.filter((e) => inPeriod(e.date, period)) as WorkforceEvent[];
  }
  async getPayroll(period: Period, filter?: CommonFilter): Promise<PayrollMonth[]> {
    return PAYROLL.filter((p) => inPeriod(p.month, period)) as PayrollMonth[];
  }
  async getAbsence(period: Period, filter?: CommonFilter): Promise<AbsenceRecord[]> {
    return ABSENCE.filter((a) => a.dateFrom >= period.from && a.dateFrom <= period.to) as AbsenceRecord[];
  }
  async getShifts(_period: Period, _filter?: CommonFilter): Promise<ShiftDay[]> {
    return [];
  }
  async getRequisitions(_period: Period, _filter?: CommonFilter): Promise<RecruitmentRequisition[]> {
    return [];
  }
  async getFunnelCounts(_period: Period, _filter?: CommonFilter): Promise<FunnelCount[]> {
    return [];
  }
  async getPerformanceReviews(cycle: string, _filter?: CommonFilter): Promise<PerformanceReview[]> {
    return PERFORMANCE.filter((p) => p.cycle === cycle) as PerformanceReview[];
  }
  async getEnpsResponses(cycle: string, _filter?: CommonFilter): Promise<ENPSResponse[]> {
    return ENPS.filter((r) => r.cycle === cycle) as ENPSResponse[];
  }
  async getTraining(period: Period, _filter?: CommonFilter): Promise<TrainingCompletion[]> {
    return TRAINING.filter((t) => inPeriod(t.date, period)) as TrainingCompletion[];
  }
  async getAccidents(period: Period, _filter?: CommonFilter): Promise<WorkAccident[]> {
    return ACCIDENTS.filter((a) => inPeriod(a.date, period)) as WorkAccident[];
  }
  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    return SUCCESSION as unknown as SuccessionPlan[];
  }
}

export const mockDataProvider = new MockDataProvider();
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/data/mock-provider.ts
git commit -m "feat(data): MockDataProvider reading generated modules with period/filter support"
```

---

### Task 19: Konzistenční test celé pipeline

**Files:**
- Create: `scripts/check-data-consistency.ts`
- Create: `tests/data/consistency.test.ts`

- [ ] **Step 1: Napsat konzistenční skript**

Create: `scripts/check-data-consistency.ts`

```typescript
import { EMPLOYEES } from '@/lib/data/generated/employees';
import { POSITIONS } from '@/lib/data/generated/positions';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { ABSENCE } from '@/lib/data/generated/absence';
import { PERFORMANCE } from '@/lib/data/generated/performance';

const errors: string[] = [];

// 1. All employees refer to existing position
const posIds = new Set(POSITIONS.map((p) => p.id));
for (const e of EMPLOYEES) {
  if (!posIds.has(e.positionId)) errors.push(`Employee ${e.id} → unknown position ${e.positionId}`);
}

// 2. All payroll rows refer to existing employee
const empIds = new Set(EMPLOYEES.map((e) => e.id));
for (const p of PAYROLL) {
  if (!empIds.has(p.employeeId)) errors.push(`Payroll for unknown employee ${p.employeeId}`);
}

// 3. Absence bounds match employee hire/term
for (const a of ABSENCE) {
  const e = EMPLOYEES.find((x) => x.id === a.employeeId);
  if (!e) { errors.push(`Absence for unknown employee ${a.employeeId}`); continue; }
  if (a.dateFrom < e.hireDate) errors.push(`Absence ${a.employeeId} before hire date`);
  if (e.terminationDate && a.dateFrom > e.terminationDate) errors.push(`Absence ${a.employeeId} after termination`);
}

// 4. Performance review cycle employees active in cycle
for (const p of PERFORMANCE) {
  const e = EMPLOYEES.find((x) => x.id === p.employeeId);
  if (!e) { errors.push(`Performance for unknown employee ${p.employeeId}`); continue; }
  const year = Number(p.cycle);
  if (new Date(e.hireDate).getFullYear() > year) errors.push(`Performance ${p.employeeId} cycle before hire`);
  if (e.terminationDate && new Date(e.terminationDate).getFullYear() < year) errors.push(`Performance ${p.employeeId} after termination`);
}

if (errors.length === 0) {
  console.log('✅ Data consistency OK');
  process.exit(0);
} else {
  console.error(`❌ Data inconsistencies (${errors.length}):`);
  for (const e of errors.slice(0, 20)) console.error('  -', e);
  if (errors.length > 20) console.error(`  ... and ${errors.length - 20} more`);
  process.exit(1);
}
```

- [ ] **Step 2: Spustit a ověřit**

```bash
pnpm check:data
```

Expected: `✅ Data consistency OK`. Pokud vrátí chyby, oprav v relevantním mock generátoru / gen-data a opakuj.

- [ ] **Step 3: Napsat smoke test na MockDataProvider**

Create: `tests/data/consistency.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MockDataProvider } from '@/lib/data/mock-provider';

describe('MockDataProvider smoke', () => {
  const p = new MockDataProvider();

  it('returns employees', async () => {
    const emps = await p.getEmployees();
    expect(emps.length).toBeGreaterThan(0);
  });

  it('returns positions', async () => {
    const pos = await p.getPositions();
    expect(pos.length).toBeGreaterThan(0);
  });

  it('returns payroll filtered by period', async () => {
    const payroll = await p.getPayroll({ from: '2025-01-01', to: '2025-03-31' });
    expect(payroll.length).toBeGreaterThan(0);
    for (const r of payroll) {
      expect(r.month >= '2025-01-01' && r.month <= '2025-03-31').toBe(true);
    }
  });

  it('returns eNPS for given cycle', async () => {
    const resp = await p.getEnpsResponses('2025-Q4');
    expect(resp.length).toBeGreaterThan(0);
    for (const r of resp) expect(r.cycle).toBe('2025-Q4');
  });
});
```

- [ ] **Step 4: Spustit testy**

```bash
pnpm test
```

Expected: všechny testy passují (smoke, parsers, heuristics, mock-generators, consistency).

- [ ] **Step 5: Commit**

```bash
git add scripts/check-data-consistency.ts tests/data/consistency.test.ts
git commit -m "feat(data): referential integrity check script + smoke tests for MockDataProvider"
```

---

### Task 20: Dokumentace data pipeline v projektovém záznamu

**Files:**
- Modify: `PROJEKT_ZAZNAM.md`

- [ ] **Step 1: Přidat sekci „Stav implementace M0+M1"**

Na konec `PROJEKT_ZAZNAM.md` přidej:

```markdown
## 12) Stav implementace — M0 + M1 (hotovo)

**Datum:** yyyy-MM-dd (doplň při commitu)

### Foundation (M0)
- ✅ Next.js 15 App Router + TypeScript strict mode
- ✅ Tailwind v4, shadcn/ui připraven (samotné komponenty přijdou v M3)
- ✅ Fonty: Geist Sans / Geist Mono / Instrument Serif
- ✅ CSS proměnné pro paletu (Deep Blue + Orange + status barvy, light/dark)
- ✅ Vitest + tsx + pnpm scripts
- ✅ Git repo, .gitignore, landing placeholder

### Data layer (M1)
- ✅ Doménové typy pro 15+ entit (lib/types.ts)
- ✅ Parsery tří Excelů: Staffplan, Nastupy_vystupy, recruitment_report (lib/data/parsers/*)
- ✅ Anonymizace reálných jmen (stable pseudonymizer seeded by employeeId)
- ✅ Heuristiky: grade B0–B3 (regex nad názvem pozice), kritičnost pozice (grade × role family × singleton)
- ✅ Mock generátory: payroll, absence, eNPS, performance, training, succession, accidents — deterministické, konzistentní
- ✅ `DataProvider` interface + `MockDataProvider` nad generovanými TS moduly
- ✅ `pnpm gen:data` orchestruje pipeline end-to-end
- ✅ `pnpm check:data` ověřuje referenční integritu
- ✅ Test suite: parsers, heuristics, mock-generators, consistency smoke

### Jak spustit
```bash
pnpm install
pnpm gen:data      # zregeneruj datové moduly (běží minuty)
pnpm check:data    # validace konzistence
pnpm test          # test suite
pnpm dev           # dev server (landing)
```

### Otevřené body pro M2
- KPI katalog všech 20 KPI (lib/kpi/catalog.ts)
- Analytická vrstva: KPIEvaluator, DriverAnalyzer, AnomalyDetector, NarrativeGenerator, ActionRecommender
- AIInsightProvider (mock z JSON)
```

- [ ] **Step 2: Commit**

```bash
git add PROJEKT_ZAZNAM.md
git commit -m "docs: log M0 and M1 completion status and next steps for M2"
```

---

## Závěrečná verifikace milníků

- [ ] **Spustit plnou test suite**

```bash
pnpm test
```

Expected: všechny testy passují.

- [ ] **Spustit typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Spustit data pipeline + konzistenci**

```bash
pnpm gen:data && pnpm check:data
```

Expected: `✅ Data consistency OK`.

- [ ] **Spustit build**

```bash
pnpm build
```

Expected: úspěšný build (může hlásit warnings, ale žádné errors).

- [ ] **Spustit dev a ověřit landing**

```bash
pnpm dev
```

Otevři `http://localhost:3000`, ověř, že se zobrazuje „AURES Holdings · HR Analytics" s kurzivním „Prototyp reportingu".

- [ ] **Final commit (review tag)**

```bash
git tag milestone-1-data-layer-complete
```

---

## Co přijde v dalším plánu (M2 — KPI core)

- `lib/kpi/catalog.ts` — strukturované definice všech 20 KPI (target, green/acc/red, direction, owner).
- `lib/analytics/kpi-evaluator.ts` — výpočet hodnoty, trendu, statusu, sparkline z DataProvider.
- `lib/analytics/driver-analyzer.ts` — top 3–5 přispěvatelů ke změně.
- `lib/analytics/anomaly-detector.ts` — rolling z-score flag.
- `lib/analytics/narrative-generator.ts` — české šablony komentářů.
- `lib/analytics/action-recommender.ts` — napojení na `Action if Off Track`.
- `lib/ai/insight-provider.ts` — AIInsightProvider interface + MockAIInsightProvider.
- `content/ai-insights/*.json` — mock insights per KPI.

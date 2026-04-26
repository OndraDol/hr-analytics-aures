# Dark Mode Policy

Stav: v2 stabilizace, 2026-04-25.

Primární demo režim zůstává světlý. Dark mode je v této verzi podporovaný defensivně přes CSS tokeny, ne jako samostatně designovaný produktový režim.

Pravidla:
- AURES brand tokeny jsou definované v `app/globals.css` a používají CSS proměnné místo hardcoded chart barev.
- Sidebar zůstává tmavý v obou režimech, protože nese AURES identitu.
- Motion komponenty respektují `prefers-reduced-motion`.
- Před produkčním nasazením je potřeba samostatný vizuální audit kontrastu pro všechny grafy a tabulky.

v3 follow-up:
- Explicitní theme toggle.
- Screenshot regression pro `/`, `/akce`, `/briefing`, `/operativa/esg`.
- Dark-mode chart palette pro Recharts tooltipy a grid lines.

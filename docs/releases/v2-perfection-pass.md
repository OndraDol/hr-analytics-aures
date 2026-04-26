# v2 Perfection Pass Release Notes

Datum: 2026-04-25

## Summary

v2 posouvá HR Analytics AURES z hotového prezentačního prototypu do decision-ready executive cockpitu pro HR Directorku. Scope zůstává demo nad hybridní real/mock datovou vrstvou; produkční Power BI, DWH, RLS a live LLM nejsou součástí této verze.

## Delivered

- M12 Decision Support Layer: KPI card zones, explainable severity, ranked alerts, action backlog timeline, threshold confidence overlay.
- M13 AURES Visual Identity: brand tokens, dark AURES sidebar, monogram, orange action CTA, dramatic Health Score typography.
- M14 Charts & Motion: custom chart tooltipy, gradient fills, sparkline hover, red threshold pulse, reduced-motion aware page transitions.
- M15 Drill-Down Intelligence: recruitment stage/channel/role drivers, cross-KPI hypotheses, anomaly flags.
- M16 PDF + ESG Polish: briefing cover page, print preview mode, ranked briefing alerts, ESG Data Quality chips.
- M17 Stabilization: v1/v2 progress model, route smoke guard, walkthrough update, release notes, dark-mode policy.

## Compatibility

No breaking data-source changes. Existing routes remain stable:
- `/`
- `/akce`
- `/briefing`
- `/sekce/*`
- `/analytika/*`
- `/operativa/*`

The `KpiCardModel`, `KpiEvaluation`, `ExecutiveDashboardData`, and `DetailTableRow` types were extended with optional/extra metadata. Existing consumers should continue to work if they ignore the new fields.

## Power BI Vendor Notes

- Treat threshold confidence and ESG Data Quality as required semantic model metadata in production.
- Recreate Top Alerts ranking and Action Backlog due buckets as deterministic DAX/measures or semantic-layer logic.
- Recruitment driver groups need real ATS dimensions for hiring manager; v2 uses stage/channel/role because raw exports do not expose hiring manager.
- PDF briefing is a prototype of the desired executive output, not a production export mechanism.

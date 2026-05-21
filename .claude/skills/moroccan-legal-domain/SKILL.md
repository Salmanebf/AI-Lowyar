---
name: moroccan-legal-domain
description: "Use this skill when working on anything that requires knowledge of Moroccan law's structure, terminology, code names, or domain-specific patterns — for example when designing eval questions, naming database fields, classifying domains, designing the domain router, writing test fixtures with realistic Moroccan legal scenarios, or deciding which legal codes to prioritize. Triggers: 'Code du Travail', 'Moudawana', 'DOC', 'Loi 65-99', 'BO', 'Bulletin Officiel', 'jurisprudence marocaine', 'mise en demeure', 'tribunal social', 'domain classifier', 'legal domain'."
---

# Moroccan Legal Domain — reference

## Primary codes (used as `code` field across the system)

| `code` value | Full name (FR) | Full name (AR) | Domain | Status |
|---|---|---|---|---|
| `code_travail` | Code du Travail (Loi 65-99) | مدونة الشغل | labor | v1 priority |
| `doc` | Code des Obligations et Contrats | قانون الالتزامات والعقود | civil baseline | v2 |
| `code_commerce` | Code de Commerce (Loi 15-95) | مدونة التجارة | commercial | v2 |
| `code_societes` | Loi sur les SA (Loi 17-95) + SARL (Loi 5-96) | قانون شركات المساهمة | commercial | v2 |
| `moudawana` | Code de la Famille (Loi 70-03) | مدونة الأسرة | family | v3 |
| `code_penal` | Code Pénal | القانون الجنائي | criminal | v3 |
| `code_proc_civ` | Code de Procédure Civile | قانون المسطرة المدنية | procedure | v3 |
| `code_proc_pen` | Code de Procédure Pénale | قانون المسطرة الجنائية | procedure | v3 |
| `cgi` | Code Général des Impôts | المدونة العامة للضرائب | fiscal | v3 |
| `code_droits_reels` | Code des Droits Réels (Loi 39-08) | مدونة الحقوق العينية | real estate | v3 |

## Labor Law (v1 scope) — key texts

- **Loi 65-99** — main Code du Travail. ~589 articles.
- **Décret n° 2-04-426** — application decree.
- **Loi 19-12** — domestic workers.
- **Loi 50-17** — temporary work agencies.
- Convention collectives sectorielles (sector-specific collective agreements).
- Jurisprudence: Cour de Cassation, Chambre Sociale.

## Frequently cited Code du Travail articles (eval seed list)

- Art. 6-8: champ d'application
- Art. 14-23: contrat de travail
- Art. 32: période d'essai
- Art. 35-41: rupture du contrat
- Art. 43-45: délai de préavis
- Art. 52-53: indemnité de licenciement
- Art. 62: licenciement pour faute grave
- Art. 184: durée du travail
- Art. 201-206: congé annuel
- Art. 269-281: salaire minimum (SMIG/SMAG)
- Art. 336-345: représentants des salariés
- Art. 549-557: procédure devant le tribunal social

## Court hierarchy (for jurisprudence)

1. **Tribunal de Première Instance** (Section Sociale for labor)
2. **Cour d'Appel** (Chambre Sociale)
3. **Cour de Cassation** (Chambre Sociale) — binding interpretations

## Domain classifier mapping

For the v2+ domain router, these phrases route to each domain:

| Domain | Trigger keywords (FR) | Trigger keywords (AR) |
|---|---|---|
| `labor_law` | salaire, licenciement, préavis, employeur, CDI, CDD, congé, SMIG, démission | أجر, فصل, إشعار, عقد عمل, إجازة |
| `commercial` | société, SARL, SA, fonds de commerce, faillite, RC | شركة, محل تجاري, سجل تجاري |
| `family` | mariage, divorce, garde, pension alimentaire, héritage, tutelle | زواج, طلاق, حضانة, نفقة, إرث |
| `criminal` | plainte, infraction, peine, garde à vue, vol, agression | شكاية, جريمة, عقوبة, حراسة نظرية |
| `real_estate` | titre foncier, immatriculation, copropriété, bail | رسم عقاري, تحفيظ, ملكية مشتركة |
| `fiscal` | IR, IS, TVA, redressement fiscal, déclaration | ضريبة دخل, ضريبة شركات, ضريبة قيمة مضافة |

## Cultural / drafting notes

- **Moroccan legal French** uses specific phrasing: `mise en demeure`, `solde de tout compte`, `chambre sociale` — keep these exact.
- **Modern Standard Arabic** in legal contexts uses specific terminology (الفصل = dismissal, الإشعار = notice, العقد المحدد المدة = fixed-term contract). Don't translate from French literally.
- **Hijri vs Gregorian dates**: official texts often carry both. Always store Gregorian in DB; show Hijri in UI only if requested.

## Useful external references

- SGG portal: https://www.sgg.gov.ma
- Adala (Bulletin Officiel + jurisprudence): https://adala.justice.gov.ma
- Ministère du Travail: https://www.mtip.gov.ma

## Anti-patterns

- Treating Moroccan law as "like French law." It diverges significantly, especially in family law (Moudawana), labor procedures, and real estate.
- Citing French Code du Travail articles. Different numbering, different rules.
- Assuming jurisprudence is binding the way it is in common law. Moroccan civil law is statute-first; jurisprudence is persuasive (except some Cour de Cassation rulings).

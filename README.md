# TMA4411 Matematikk 2B – kursnettsted våren 2027

Quarto-nettsted for TMA4411 Matematikk 2B ved NTNU: framdriftsplan,
forelesningsplan uke for uke, interaktive oppgaver med løsningsforslag og de
obligatoriske innleveringene. Interaktive matematikkoppgaver, AI-tilbakemelding
og Python i nettleseren kommer fra
[CTM Assessment](https://github.com/Erasmus-CTM/ctm-assessment).

**Nettsted:** <https://tobyjavascript.github.io/2027v-TMA4411/>

Oppsettet er hentet fra [ingmat3a_ntnu](https://github.com/aacchhee/ingmat3a_ntnu)
(Matematikk 3A), med eget innhold for TMA4411.

## Innhold og kilder

| På nettstedet | Kilde (2026-materialet) |
|---|---|
| Forside og ukeplaner (`_includes/ukeNN/plan.md`) | Framdriftsplan og wiki-framdriftsplan Matte 2B, semesterplan 2027 (utkast) |
| Oppgaver (`_includes/ukeNN/oppgaver.md`) | Flervalgsoppgaver 1–13 med fasit (2B-versjonene for sett 10–13) |
| Innleveringer (`_includes/innleveringer/`) | Innlevering 1–4 (2B-versjonen av innlevering 4), notebooken til innlevering 3 i `assets/` |
| «Materiell» på ukesidene (`_includes/ukeNN/materiell.md`) | PDF-er fra [fremdriftsplanen 2026 på wikien](https://wiki.math.ntnu.no/tma4411/2026v/fremdriftsplan), kopiert til `assets/materiell/`: lysark, plenumsregning med notater, prøveeksamen med LF, info om emnet og innleveringsarkene |

Materiellet fra 2026 er plassert på ukesiden med samme tema. Plenumsregningen
gikk annenhver uke og repeterte stoffet fra ukene før, så den står på uken den
ble holdt. Bytt ut PDF-ene i `assets/materiell/` og lenkene i `materiell.md`
når materiellet for 2027 er klart.

Flervalgsoppgavene er skrevet om til åpne oppgaver som dekker samme problem:
studenten regner ut et svar i stedet for å velge et alternativ. Hver oppgave
har

- en eksplisitt kontekstblokk (`.math-exercise-context`) som definerer begreper
  og oppgavedata, og som oppgaven refererer til med `#| context:` slik at
  AI-tilbakemeldingen får riktige forutsetninger,
- et sammenleggbart løsningsforslag rett etter oppgaven, som også oppgir
  konklusjonen i den opprinnelige flervalgsversjonen.

Egendefinerte sjekkere (`mode: custom`) har `tests:` som kjøres ved
`quarto render`. Innleveringene er statiske oppgavetekster uten automatisk
retting og uten løsningsforslag.

## Sidestruktur

Filene i `pages/` er små samlefiler med tittel og `include`-er. Innholdet ligger
i `_includes/`:

```text
pages/ukeNN.qmd        -> _includes/ukeNN/plan.md + oppgaver.md (to faner)
pages/innleveringN.qmd -> _includes/innleveringer/innleveringN.md
pages/ide.qmd          -> _includes/ide/setup.md + manual.md
```

Navigasjonen defineres i `_quarto.yml`.

## Lokal forhåndsvisning

Installer Quarto (1.8.27 eller nyere), Git og Python med PyYAML og SymPy
(SymPy trengs for oppgavetestene). Installer CTM Assessment og forhåndsvis:

```bash
python -m pip install pyyaml sympy jupyter
python scripts/setup.py
quarto preview
```

På Windows peker `python3` ofte til Microsoft Store. Sett da
`MATH_EXERCISE_PYTHON=python` før `quarto render`/`quarto preview`, ellers
feiler testene for oppgavene.

`quarto-extensions.yml` angir hvilken gren eller commit av ctm-assessment som
installeres (`main` som standard; lås til en commit for semesteret ved behov).

## Publisering

`.github/workflows/quarto.yml` installerer CTM Assessment, rendrer nettstedet
og publiserer til grenen `gh-pages` ved push til `main`. Første gang: aktiver
GitHub Pages i repoinnstillingene med kilde *Deploy from a branch*,
grenen `gh-pages` og mappen `/ (root)`.

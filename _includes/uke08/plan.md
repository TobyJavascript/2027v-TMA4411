**Uke 9 i kalenderen, 1.–5. mars 2027.** Innlevering 3 hører til denne
perioden (fristen er ikke fastsatt). Referansene denne og neste uke viser til
A. Quarteroni, F. Saleri og P. Gervasio, *Scientific Computing with MATLAB and
Octave* (kapittel 8).

De fleste differensialligninger kan ikke løses eksakt. Numeriske metoder
erstatter $y'(t)$ med differensekvotienter og regner seg fram steg for steg.
Spørsmålene er hvor nøyaktig metoden er (konsistens og orden), og om feilene
holder seg små over mange steg (stabilitet og konvergens).

::: {.columns}
::: {.column width="50%"}

#### Forelesning I – Differensialligninger II

- Eksistens og entydighet av løsninger av ODE-er (Prop. 8.1)
- Et eksempel uten entydig løsning
- Den generelle strategien bak numeriske metoder (Sek. 8.2)
- Motivasjon for tilnærmingen av $y'(t)$
- Eksempler på numeriske metoder:
  - eksplisitt (forlengs) Euler (Sek. 8.3)
  - implisitt (baklengs) Euler (Sek. 8.3)
  - trapesmetoden / Crank–Nicolson (Sek. 8.4)

**Les:** Quarteroni 8.1–8.4

:::
::: {.column width="50%"}

#### Forelesning II – konvergens og feilanalyse

- Konvergens for numeriske metoder (Sek. 8.3)
- Konvergensanalyse for eksplisitt Euler: konsistens, feilskranke og
  konvergens (Sek. 8.3.1)
- Eksplisitt Euler: estimater for den lokale feilen ved hjelp av
  middelverdisetningen, og stabilitetskriteriet (Sek. 8.3.1)
- Repetisjon av Taylorpolynomet med restledd
- Trapesmetoden / Crank–Nicolson: estimater for den lokale feilen (Sek. 8.4)

**Les:** Quarteroni 8.3–8.4

:::
:::

::: {.callout-note title="Antas kjent fra TMA4400"}

- **Forelesning I:** differensialligninger, den deriverte, Eulers metode og
  trapesmetoden (Hole B1 9.1–9.3, 6.1, 6.3, 9.4, 7.12).
- **Forelesning II:** grenser, Taylorpolynom og trapesmetoden
  (Hole B1 5.1–5.3, 10.3, 7.12).

:::

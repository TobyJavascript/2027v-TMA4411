::: {.callout-important title="Obligatorisk innlevering – foreløpig versjon"}

Dette er innlevering 1 slik den ble gitt i 2026. Oppgavesettet og fristen for
2027 er ikke fastsatt; følg med på kunngjøringer i emnet. Innleveringen dekker
stoffet fra uke 1–3.

- Godkjent betyr at du ville bestått hvis innleveringen utgjorde en eksamen.
- Som ved eksamen må alle svar begrunnes, og du må ta med så mye mellomregning
  at framgangsmåten kommer tydelig fram.
- Besvarelsen leveres som **én pdf-fil**. Innleveringer i feil format underkjennes.

:::

Oppgavearket fra 2026 som PDF: [2BInnlevering1.pdf](../assets/materiell/2BInnlevering1.pdf){target="_blank"}

### Oppgave 1

La ${ \mathcal{M}_n }$ utgjøre vektorrommet av komplekse ${ n \times n }$-matriser og vis at mengden $$\left\{ \begin{bmatrix}
a_{11} & 0 & \cdots & 0 \\
a_{21} & a_{22} & \cdots & 0 \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}
\Bigg | \, a_{ij} \in \mathbb{C} \textnormal{ for } 1 \leq j \leq i \leq n \right \}$$ av nedre triangulære ${ n \times n }$-matriser er et underrom av ${ \mathcal{M}_n }$.

Hver reell $m\times n$ matrise $A$ definerer en lineærtransformasjon $T: \mathbb{R}^n\to \mathbb{R}^m$ gitt ved $T({\bf x})= A{\bf x}$ og det gjelder for

- nullrommet til $A$: $\mathrm{Nul} \,A=\mathrm{Ker}\, T$ og en skriver også $\mathrm{Ker}\, A$ istedenfor $\mathrm{Nul} \,A$.

- søylerommet til $A$: $\mathrm{Col}\, A =\mathrm{Ran}\, T$ og en skriver også $\mathrm{Ran}\, A$ istedenfor $\mathrm{Col} \,A$.

Dessuten betegnes søylerommet til en matrise også som kolonnerommet.

I tillegg til kolonnerommet og nullrommet finnes også radrommet, $\mathrm{Row}\, A$, til matrisen $A$, som betegner underrommet av $\mathbb{R}^n$ utspent av radvektorene i $m\times n$ matrisen $A$.

### Oppgave 2

Avgjør om vektoren ${ \begin{bmatrix}
1 \\ 2 \\ 1 \\ 0
\end{bmatrix}}$ ligger i ${ \mathrm{Ker} \,A }$ når $$A = \begin{bmatrix}
1 & -1 & 1 & 0 \\
0 & 2 & -4 & 1 \\
3 & 0 & -3 & 2
\end{bmatrix}.$$ Hva er dimensjonen til ${ \mathrm{Ran}\, A}$?

### Oppgave 3

Finn en basis for kolonnerommet, nullrommet og radrommet til følgende matriser: $$A =
\begin{bmatrix}
3 & -1  &   1  &  14  &  -8 \\
0  &   2 &   -1 &    1 &    5 \\
2  &   0   &  1   & 13   & -3
\end{bmatrix}
\quad \text{ og } \quad B = 
\begin{bmatrix}
1  &   2 &    3 \\
-2  &   3   &  4 \\
3   & -4   &  5 \\
4  &  -5   &  6
\end{bmatrix}
.$$ Bestem også dimensjonen til hvert av disse rommene for begge matrisene.

Hvis $A$ er en $m\times n$ matrise, så definerer vi den transponerte $A^T$ av matrisen $A$ til å være $n\times m$ matrisen man får ved å la rad nummer $i$ fra $A$ være søyle nummer $i$ for den nye matrisen $A^T$.

### Oppgave 4

La ${ A }$ være en reell ${ 4 \times 5 }$-matrise. Begrunn svarene på følgende spørsmål.

**a)** Hva er maksimal mulig dimensjon til ${ \mathrm{Ran} \,A }$?

**b)** Hvis ${ \dim (\mathrm{Ker} \,A) = 2 }$, hvor mange lineært uavhengige kolonner har ${ A }$?

**c)** Hvis ${ A \neq 0 }$, hva er minste mulige antall lineært uavhengige rader i ${ A }$?

**d)** Hva er ${ \dim (\mathrm{Row} \,A^T )}$ når systemet ${ A \bf{ x } = \bf{ 0 } }$ har 3 frie parametre?

**e)** Kan ${ \mathrm{Ker} \,A = \{ \bf{0 }\}}$?

### Oppgave 5

Du får oppgitt at ${ T \colon \mathbb{R}^2 \to \mathbb{R}^3 }$ er en lineærtransformasjon hvor $$T \left( \begin{bmatrix}
1 \\ 2
\end{bmatrix} \right) = \begin{bmatrix}
5 \\ 2 \\ -1
\end{bmatrix}
\quad \text{og} \quad T \left( \begin{bmatrix}
-1 \\ 3
\end{bmatrix} \right) = \begin{bmatrix}
0 \\ 1 \\ 1
\end{bmatrix}.$$

**a)** Finn ${ \displaystyle T \left( \begin{bmatrix}
3 \\ 1
\end{bmatrix}
 \right) }$.

**b)** Finn ut om ${ T }$ er injektiv og/eller surjektiv.

### Oppgave 6

Bestem ${ \mathrm{rank} \, B }$ og ${ \mathrm{Ker} \,B }$ når ${ B }$ er en ${ n \times n }$-matrise med ${ \det B \neq 0 }$.

### Oppgave 7

La ${ V }$ utgjøre et (reelt) underrom av de kontinuerlige funksjonene fra ${ \mathbb{R} }$ til ${ \mathbb{R} }$ med basis $$\mathcal{B} = \{1 \text{ (konstantfunksjon)} , \cos x, \cos (2x) \}$$ og la ${ T \colon V \to \mathbb{R}^3 }$ være gitt ved $$T \colon a + b \cos (x) + c \cos(2x) \mapsto \begin{bmatrix}
c \\ 2a + b \\ b - 3c
\end{bmatrix}.$$

**a)** Vis at ${ \sin^2 (x) }$ og ${ \cos^2 (x) }$ ligger i ${ V }$ ved å finne koordinatene til disse funksjonene med hensyn på ${ \mathcal{B} }$.

(*Hint: Trigonometriske halvvinkel-formler.*)

**b)** Er ${ T }$ en lineærtransformasjon?

**c)** Er ${ V }$ isomorf med ${\mathbb{R}^3 }$?

### Oppgave 8

Anta at ${ S \colon W \to V }$ er en invers til en lineærtransformasjon ${ T \colon V \to W }$. Per definisjon vil det si at ${ S }$ er en lineærtransformasjon som tilfredsstiller $$\begin{alignedat}{2}
S(T(v)) &= v \qquad && \text{for alle } v \in V \text{, og} \\
T(S(w)) &= w \qquad && \text{for alle } w \in W.
\end{alignedat}$$

**a)** Hvilken av egenskapene over beskriver at ${ T }$ er injektiv, og hvilken egenskap beskriver at ${ T }$ er surjektiv?

**b)** Hva blir ${ \mathrm{Ran} \,T }$?

**c)** Er ${ S }$ en isomorfi mellom ${ W }$ og ${ V }$?

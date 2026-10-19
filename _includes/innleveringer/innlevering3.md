::: {.callout-important title="Obligatorisk innlevering – foreløpig versjon"}

Dette er innlevering 3 slik den ble gitt i 2026. Oppgavesettet og fristen for
2027 er ikke fastsatt; følg med på kunngjøringer i emnet. Innleveringen dekker
stoffet fra uke 7–9.

- Godkjent betyr at du ville bestått hvis innleveringen utgjorde en eksamen.
- Som ved eksamen må alle svar begrunnes, og du må ta med så mye mellomregning
  at framgangsmåten kommer tydelig fram.
- Besvarelsen leveres som **én pdf-fil** for oppgave 1–3 og **én Jupyter notebook** for oppgave 4. Innleveringer i feil format underkjennes.

:::

Oppgavearket fra 2026 som PDF: [2BInnlevering3.pdf](../assets/materiell/2BInnlevering3.pdf){target="_blank"}

### Oppgave 1

**a)** Finn følgende matrisers egenverdier og tilhørende egenvektorer. Avgjør så om matrisene er diagonaliserbar. $$A= \begin{bmatrix} 5 & -1\\ 1 & 3\end{bmatrix} \quad \text{ og } B=\begin{bmatrix} 5 & 0 & 4 \\ 0 & 1 & 0 \\ 2 & 0 & 3\end{bmatrix}$$

**b)** Anta at $M$ og $N$ er to kvadratiske matriser som er similære, dvs. det finnes en inverterbar matrise $S$ slik at $M=SNS^{-1}$.

1.  La ${\bf x}$ være en egenvektor til $N$ med tilhørende egenverdi $\lambda$. Vis at $\lambda$ er også en egenverdi til $M$ og finn en tilhørende egenvektor ${\bf y}$.

2.  Anta $N$ er diagonaliserbar. Vis at også $M$ og $M-I$ er diagonaliserbar.

### Oppgave 2

La $$A= \begin{bmatrix} 1 & 2 & -1\\ 1 & 0 & 1 \\ 4 & -4 & 5\end{bmatrix}.$$

**a)** Finn en matrise $P$ og en diagonalmatrise $D$ slik at $A= PDP^{-1}$.

**b)** Løs differensialligningssystemet ${\bf y}'= A{\bf y}$ med initialkravet ${\bf y}^{T}(0)=(-2, 5, 2)$.

### Oppgave 3

Gitt andreordens differensialligningen $$y''(t)-6y'(t)+5y(t)= f(t) . \tag{1}$$

**a)** Omformulér den gitte andreordens differensialligningen til førsteordenssystem.

**b)** Bruk førsteordenssystemet til å bestemme den generelle løsningen til (1) med $f(t)=0$.

**c)** Bestem løsning $y(t)$ av differensialligningen (1) med $f(t)=5t^2-7t+1$, som oppfyller initialkravet $y(0)=2$ og $y'(0)=6$.

### Oppgave 4

Oppgaveteksten finnes i Jupyter-notebooken [Innlevering3Oppgave4.ipynb](../assets/Innlevering3Oppgave4.ipynb){download="Innlevering3Oppgave4.ipynb"}. Last ned notebooken, legg til svarene dine og lever den i innleveringssystemet.

Oppgaven bruker numeriske metoder fra [uke 8](../pages/uke08.qmd) og [uke 9](../pages/uke09.qmd): `solve_ivp` fra SciPy, eksplisitt Euler, forbedret Euler og Kuttas tredjeordens metode, brukt på populasjonsdynamikk, banen til en baseball og et lineært system $y'=Ay$.

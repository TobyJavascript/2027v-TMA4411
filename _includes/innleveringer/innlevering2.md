::: {.callout-important title="Obligatorisk innlevering – foreløpig versjon"}

Dette er innlevering 2 slik den ble gitt i 2026. Oppgavesettet og fristen for
2027 er ikke fastsatt; følg med på kunngjøringer i emnet. Innleveringen dekker
stoffet fra uke 4–6.

- Godkjent betyr at du ville bestått hvis innleveringen utgjorde en eksamen.
- Som ved eksamen må alle svar begrunnes, og du må ta med så mye mellomregning
  at framgangsmåten kommer tydelig fram.
- Besvarelsen leveres som **én pdf-fil**. Innleveringer i feil format underkjennes.

:::

Oppgavearket fra 2026 som PDF: [2BInnlevering2.pdf](../assets/materiell/2BInnlevering2.pdf){target="_blank"}

### Oppgave 1

La $B = \{(1,0,0), (1,1,0), (1,1,1)\}$ og $C = \{(1,2,1), (2,5,0), (3,3,8)\}$. Finn $[\mathrm{id}]_{C\leftarrow B}$, overgangsmatrisen fra basisen $B$ til basisen $C$.

### Oppgave 2

La $$\mathbf{u} = \begin{bmatrix}
4 \\ -2 \\ 1
\end{bmatrix}
\quad \text{og} \quad
\mathbf{v} = \begin{bmatrix}
1 \\ 2 \\ 1
\end{bmatrix}.$$

**a)** Finn projeksjonen $\mathrm{proj}_V{\bf u}$ av vektoren ${\bf u}$ på underrommet $V= \mathrm{Span} \{\bf v\}\subset \mathbb{R}^3$.

**b)** Hva blir $\mathrm{proj}_V\big(\mathrm{proj}_V(\mathbf{u})\big)$?

**c)** Avstanden mellom en vektor ${\bf x}\in \mathbb{R}^3$ og underrommet $V\subset \mathbb{R}^3$ er gitt ved $$d({\bf x}, V)= \min_{{\bf v}\in V}\|{\bf x}- {\bf v}\|,$$ Beregn avstanden mellom $\mathbf{u}$ og $V$.

### Oppgave 3

La $W = \mathrm{Span}\{\mathbf{u}, \mathbf{v}\}$, der $$\mathbf{u} = \begin{bmatrix}
2 \\ -5 \\ 1
\end{bmatrix}
\quad \text{og} \quad
\mathbf{v} = \begin{bmatrix}
4 \\ -4 \\ 2
\end{bmatrix}.$$

**a)** Finn en ortogonal basis for $W$.

**b)** La $P_W: \mathbb{R}^3 \to \mathbb{R}^3$ være projeksjonsavbildningen ned på $W$, som er definert ved $P({\bf x})= \mathrm{proj}_W{\bf x}$. Finn $[P_W]=[P_W]_B$, matriserepresentasjonen til projeksjonen $P_W$, der $B$ betegner standardbasisen for $\mathbb{R}^3$.

**c)** Finnes det en $3\times 2$--matrise $A$ slik at $[P_W]A\mathbf{x} = A\mathbf{x}$ for alle $\mathbf{x} \in \mathbb{R}^2$? I så fall, finn den.

*Hint: Tenk geometrisk her.*

### Oppgave 4

La $Q$ være en såkalt ortogonal $n \times n$-matrise, dvs. kolonnene utgjør en ortonormal basis for $\mathbb{R}^n$.

**a)** Regn ut $Q^{\top}Q$ og bestem $Q^{-1}$.

**b)** Vis at mulige verdier til $\det Q$ er bare $\pm 1$.

### Oppgave 5

La $U$ være underrommet av $\mathbb{R}^4$ utspent av vektorene $$\mathbf{u} =
\begin{bmatrix}
0 \\ -1 \\ 0 \\ 1
\end{bmatrix}
\quad \text{og} \quad
\mathbf{v} =
\begin{bmatrix}
1 \\ 0 \\ 1 \\ 2
\end{bmatrix}.$$

**a)** Finn en ortogonal basis for $U$ ved hjelp av Gram--Schmidt-prosessen.

**b)** La $P_U: \mathbb{R}^4 \to \mathbb{R}^4$ være projeksjonsavbildningen ned på $U$, som er definert ved $P({\bf x})= \mathrm{proj}_U{\bf x}$. Finn $[P_U]=[P_U]_B$, matriserepresentasjonen til projeksjonen $P_U$, der $B$ betegner standardbasisen for $\mathbb{R}^4$.

**c)** Hva er $\dim U^\perp$?

**d)** Finn en basis for $U^\perp$, det ortogonale komplementet til $U$ i $\mathbb{R}^4$.

### Oppgave 6

La $U$ være en delmengde av et indreproduktrom $V$. Vis at det ortogonale komplementet $$U^\perp = \{\, v \in V : \langle v,u\rangle = 0 \text{ for alle } u \in U \,\}$$ er et underrom av $V$.

### Oppgave 7

La $C([0,1])$ være vektorrommet av alle kontinuerlige funksjoner $f:[0,1]\to \mathbb{R}$ utstyrt med indreproduktet $$\langle f,g\rangle = \int_0^1 f(x)g(x)\,dx.$$

**a)** Avgjør om funksjonene $x$ og $\dfrac{1}{x^2+1}$ er ortogonale i $C([0,1])$.

**b)** Finn en ortogonal basis for $\mathrm{Sp}\{1,x^2,x^4\}$.

**c)** Beregn normen $$\left\| \frac{1}{\sqrt{x^2+1}} \right\|.$$ *Vink:* $\displaystyle \int \frac{dx}{x^2+1} = \arctan(x) + C$.

### Oppgave 8

La $C([0,1])$ være vektorrommet av alle kontinuerlige funksjoner $f:[0,1]\to \mathbb{R}$ utstyrt med indreproduktet. $$\langle f,g\rangle = \int_0^1 f(x)g(x)\,dx.$$

**a)** Regn ut vinkelen mellom

1.  $x$ og $\cos x$

2.  $x$ og $\sin x$.

Hvilken vinkel er minst?

**b)** Regn ut avstanden mellom

1.  $x$ og $\cos x$

2.  $x$ og $\sin x$.

Hvilken avstand er minst?

*Hint:* Husk at avstanden mellom to vektorer $f$ og $g$ er lik normen til $f-g$.

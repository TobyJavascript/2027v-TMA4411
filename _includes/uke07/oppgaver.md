Oppgavene bygger på flervalgsoppgavesett 7 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke07-diagonal-context .math-exercise-context}

**Begreper i denne uken.**

- En $n\times n$-matrise $A$ er *diagonaliserbar* hvis det fins en invertibel
  $P$ og en diagonal $D$ med $A=PDP^{-1}$, det vil si $AP=PD$. Kolonnene i $P$
  er da egenvektorer, og diagonalelementene i $D$ er de tilhørende
  egenverdiene, i samme rekkefølge.
- $A$ er diagonaliserbar hvis og bare hvis summen av dimensjonene til
  egenrommene er $n$. Reelle symmetriske matriser er alltid (ortogonalt)
  diagonaliserbare.
- $A^k=PD^kP^{-1}$.
- Hvis $A=PDP^{-1}$, er den generelle løsningen av $y'=Ay$ gitt ved
  $y(t)=c_1e^{\lambda_1t}p_1+\dots+c_ne^{\lambda_nt}p_n$.

Det karakteristiske polynomet er $p(\lambda)=\det(A-\lambda I)$. I svarfeltene
skriver du variabelen som `x` i stedet for $\lambda$, og $e^{t}$ som `exp(t)`.

:::

### Oppgave 1 – en symmetrisk matrise

::: {#uke07-opp1-context .math-exercise-context}

$$
A=\begin{pmatrix}-4&0&0\\0&4&4\\0&4&-2\end{pmatrix}.
$$

:::

#### a) Egenverdier og egenrom

```{math-exercise}
#| label: uke07-opp1a-karpol
#| caption: Karakteristisk polynom og egenrom
#| mode: equivalent
#| vars: x
#| field-labels: p(x), dimensjonen til egenrommet for −4, dimensjonen til egenrommet for 6
#| context: uke07-diagonal-context, uke07-opp1-context

$p(x)=\det(A-xI)=$ ___[-(x+4)**2*(x-6)]
$\dim\operatorname{Null}(A+4I)=$ _[2]
$\dim\operatorname{Null}(A-6I)=$ _[1]
```

#### b) Diagonaliser $A$

```{math-exercise}
#| label: uke07-opp1b-diagonaliser
#| caption: Finn P og D
#| mode: custom
#| context: uke07-diagonal-context, uke07-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       A = Matrix([[-4, 0, 0], [0, 4, 4], [0, 4, -2]])
#|       P = response["inputs"]["P"]["matrix"]
#|       D = response["inputs"]["D"]["matrix"]
#|       if P.shape != (3, 3) or D.shape != (3, 3):
#|           return {"score": 0}
#|       diagonal = D.is_diagonal()
#|       invertible = simplify(P.det()) != 0
#|       eigen = simplify(A * P - P * D) == zeros(3, 3)
#|       if diagonal and invertible and eigen:
#|           return {"score": 1}
#|       if not diagonal:
#|           return {"score": 0, "feedback": "D må være en diagonalmatrise."}
#|       if not invertible:
#|           return {"score": 0.5 if eigen else 0, "feedback": "Kolonnene i P er lineært avhengige, så P er ikke invertibel."}
#|       return {"score": 0, "feedback": "AP er ikke lik PD. Sjekk at kolonne j i P er en egenvektor for egenverdien på plass j i D."}
#| tests: |
#|   def test(check, symbols):
#|       def score(P, D):
#|           return check({"inputs": {"P": {"matrix": P}, "D": {"matrix": D}}}, symbols)["score"]
#|       assert score(Matrix([[1, 0, 0], [0, 1, 2], [0, -2, 1]]), diag(-4, -4, 6)) == 1
#|       assert score(Matrix([[0, 0, 1], [1, 2, 0], [-2, 1, 0]]), diag(-4, 6, -4)) == 1
#|       assert score(Matrix([[1, 0, 0], [0, 2, 1], [0, 1, -2]]), diag(-4, -4, 6)) < 1
#|       assert score(Matrix([[1, 1, 0], [0, 0, 2], [0, 0, 1]]), diag(-4, -4, 6)) < 1

Finn en invertibel $P$ og en diagonal $D$ slik at $A=PDP^{-1}$.

$P=$ mat{name=P, rows=3, cols=3}

$D=$ mat{name=D, rows=3, cols=3}
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** Utvikling langs første rad gir

$$
p(\lambda)=(-4-\lambda)\big[(4-\lambda)(-2-\lambda)-16\big]
=-(\lambda+4)(\lambda^2-2\lambda-24)=-(\lambda+4)^2(\lambda-6).
$$

Siden $A$ er symmetrisk, vet vi *allerede før vi regner* at $A$ er
diagonaliserbar, så egenrommet for den doble egenverdien $-4$ må ha dimensjon
$2$. Kontroll:

$$
A+4I=\begin{pmatrix}0&0&0\\0&8&4\\0&4&2\end{pmatrix}\ \Rightarrow\
\operatorname{Null}(A+4I)=\operatorname{span}\{(1,0,0),(0,1,-2)\},
$$

og $\operatorname{Null}(A-6I)=\operatorname{span}\{(0,2,1)\}$.

**b)** Med egenvektorene som kolonner, i samme rekkefølge som egenverdiene:

$$
P=\begin{pmatrix}1&0&0\\0&1&2\\0&-2&1\end{pmatrix},\qquad
D=\begin{pmatrix}-4&0&0\\0&-4&0\\0&0&6\end{pmatrix}.
$$

Rekkefølgen kan endres så lenge $P$ og $D$ endres likt, og egenvektorene kan
skaleres. For eksempel virker også $D=\operatorname{diag}(-4,6,-4)$ med
$P=\begin{pmatrix}0&0&1\\1&2&0\\-2&1&0\end{pmatrix}$. Derimot er
$(0,2,1)$ ikke en egenvektor for $-4$, så
$P=\begin{pmatrix}1&0&0\\0&2&1\\0&1&-2\end{pmatrix}$ med
$D=\operatorname{diag}(-4,-4,6)$ er feil.

**Konklusjon fra flervalgsversjonen:** (i); ja, fordi $A$ er symmetrisk; $2$;
(i) og (iii).

:::

### Oppgave 2 – en matrise som ikke er symmetrisk

::: {#uke07-opp2-context .math-exercise-context}

$$
A=\begin{pmatrix}-4&0&0\\0&4&2\\0&8&-2\end{pmatrix}.
$$

:::

#### a) Egenverdier og egenrom

```{math-exercise}
#| label: uke07-opp2a-karpol
#| caption: Karakteristisk polynom og egenrom
#| mode: equivalent
#| vars: x
#| field-labels: p(x), dimensjonen til egenrommet for −4
#| context: uke07-diagonal-context, uke07-opp2-context

$p(x)=\det(A-xI)=$ ___[-(x+4)**2*(x-6)]
$\dim\operatorname{Null}(A+4I)=$ _[2]
```

#### b) Diagonaliser $A$

```{math-exercise}
#| label: uke07-opp2b-diagonaliser
#| caption: Finn P og D
#| mode: custom
#| context: uke07-diagonal-context, uke07-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       A = Matrix([[-4, 0, 0], [0, 4, 2], [0, 8, -2]])
#|       P = response["inputs"]["P"]["matrix"]
#|       D = response["inputs"]["D"]["matrix"]
#|       if P.shape != (3, 3) or D.shape != (3, 3):
#|           return {"score": 0}
#|       diagonal = D.is_diagonal()
#|       invertible = simplify(P.det()) != 0
#|       eigen = simplify(A * P - P * D) == zeros(3, 3)
#|       if diagonal and invertible and eigen:
#|           return {"score": 1}
#|       if not diagonal:
#|           return {"score": 0, "feedback": "D må være en diagonalmatrise."}
#|       if not invertible:
#|           return {"score": 0.5 if eigen else 0, "feedback": "Kolonnene i P er lineært avhengige, så P er ikke invertibel."}
#|       return {"score": 0, "feedback": "AP er ikke lik PD. Sjekk at kolonne j i P er en egenvektor for egenverdien på plass j i D."}
#| tests: |
#|   def test(check, symbols):
#|       def score(P, D):
#|           return check({"inputs": {"P": {"matrix": P}, "D": {"matrix": D}}}, symbols)["score"]
#|       assert score(Matrix([[0, 1, 0], [1, 0, 1], [1, 0, -4]]), diag(6, -4, -4)) == 1
#|       assert score(Matrix([[0, 0, 1], [1, 1, 0], [1, -4, 0]]), diag(6, -4, -4)) == 1
#|       assert score(Matrix([[0, 1, 0], [1, 0, 1], [1, 0, -4]]), diag(-4, 6, -4)) < 1

Finn en invertibel $P$ og en diagonal $D$ slik at $A=PDP^{-1}$.

$P=$ mat{name=P, rows=3, cols=3}

$D=$ mat{name=D, rows=3, cols=3}
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**a)** $p(\lambda)=(-4-\lambda)\big[(4-\lambda)(-2-\lambda)-16\big]=-(\lambda+4)^2(\lambda-6)$,
det samme som i oppgave 1. Men nå er $A$ **ikke** symmetrisk, så vi kan ikke
konkludere med diagonaliserbarhet før vi har sjekket dimensjonen til
egenrommet for den doble egenverdien:

$$
A+4I=\begin{pmatrix}0&0&0\\0&8&2\\0&8&2\end{pmatrix}\ \Rightarrow\
\operatorname{Null}(A+4I)=\operatorname{span}\{(1,0,0),(0,1,-4)\},
$$

som har dimensjon $2$. Videre er $\operatorname{Null}(A-6I)=\operatorname{span}\{(0,1,1)\}$.

**b)** $2+1=3$, så $A$ er diagonaliserbar, for eksempel med

$$
P=\begin{pmatrix}0&1&0\\1&0&1\\1&0&-4\end{pmatrix},\qquad
D=\begin{pmatrix}6&0&0\\0&-4&0\\0&0&-4\end{pmatrix}.
$$

Å bytte de to siste kolonnene i $P$ gir også en riktig løsning med samme $D$.

**Konklusjon fra flervalgsversjonen:** (i); nei, egenrommene må sjekkes først;
$2$; (i) og (ii).

:::

### Oppgave 3 – en matrise som ikke kan diagonaliseres

::: {#uke07-opp3-context .math-exercise-context}

$$
A=\begin{pmatrix}2&0\\4&2\end{pmatrix}.
$$

:::

```{math-exercise}
#| label: uke07-opp3-jordan
#| caption: For få egenvektorer
#| mode: equivalent
#| vars: x
#| field-labels: p(x), dimensjonen til egenrommet for 2, antall lineært uavhengige egenvektorer
#| context: uke07-diagonal-context, uke07-opp3-context

$p(x)=\det(A-xI)=$ __[(x-2)**2]
$\dim\operatorname{Null}(A-2I)=$ _[1]
Maksimalt antall lineært uavhengige egenvektorer: _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

$A-\lambda I$ er nedre triangulær, så $p(\lambda)=(2-\lambda)^2=(\lambda-2)^2$.
Eneste egenverdi er $2$, med algebraisk multiplisitet $2$.

$A-2I=\begin{pmatrix}0&0\\4&0\end{pmatrix}$, så $(A-2I)v=0$ gir $4v_1=0$.
Egenrommet er $\operatorname{span}\{(0,1)\}$, med dimensjon $1$.

En diagonalisering av en $2\times2$-matrise krever to lineært uavhengige
egenvektorer. Det fins bare én, så $A$ er **ikke** diagonaliserbar. At det fins
*minst én* egenvektor er ikke nok.

**Konklusjon fra flervalgsversjonen:** $(\lambda-2)^2$; $1$; nei.

:::

### Oppgave 4 – potenser

::: {#uke07-opp4-context .math-exercise-context}

La $A=PDP^{-1}$, der

$$
D=\begin{pmatrix}1&0\\0&2\end{pmatrix},\qquad P=\begin{pmatrix}2&1\\1&1\end{pmatrix}.
$$

:::

```{math-exercise}
#| label: uke07-opp4-potens
#| caption: Regn ut A og A⁴
#| mode: equivalent
#| field-labels: A_11, A_12, A_21, A_22, (A⁴)_11, (A⁴)_12, (A⁴)_21, (A⁴)_22
#| context: uke07-diagonal-context, uke07-opp4-context

$A=$ mat[0, 2; -1, 3]

$A^4=$ mat[-14, 30; -15, 31]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

$P^{-1}=\dfrac{1}{2-1}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$, så

$$
A=\begin{pmatrix}2&1\\1&1\end{pmatrix}\begin{pmatrix}1&0\\0&2\end{pmatrix}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}
=\begin{pmatrix}2&2\\1&2\end{pmatrix}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}
=\begin{pmatrix}0&2\\-1&3\end{pmatrix}.
$$

$A^4=PD^4P^{-1}$ med $D^4=\operatorname{diag}(1,16)$:

$$
A^4=\begin{pmatrix}2&16\\1&16\end{pmatrix}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}
=\begin{pmatrix}-14&30\\-15&31\end{pmatrix}.
$$

Kontroll: $\operatorname{tr}A^4=17=1^4+2^4$ og $\det A^4=-434+450=16=(1\cdot2)^4$.

**Konklusjon fra flervalgsversjonen:** (iii).

:::

### Oppgave 5 – lineære systemer av differensialligninger

::: {#uke07-opp5-context .math-exercise-context}

La

$$
A=\begin{pmatrix}0&1\\-2&3\end{pmatrix}=PDP^{-1},\qquad
D=\begin{pmatrix}1&0\\0&2\end{pmatrix},\qquad P=\begin{pmatrix}1&1\\1&2\end{pmatrix}.
$$

Skriv konstantene som `c1`, `c2` og $e^{t}$ som `exp(t)`.

:::

#### a) Det frakoblede systemet

```{math-exercise}
#| label: uke07-opp5a-diagonal
#| caption: Løs x′ = Dx
#| mode: equivalent
#| vars: t, c1, c2
#| field-labels: x_1(t), x_2(t)
#| context: uke07-diagonal-context, uke07-opp5-context

Finn den generelle løsningen av $x'(t)=Dx(t)$, med $x(0)=(c_1,c_2)$. Skriv $e^{t}$ som `exp(t)` (ikke `e^t`).

$x_1(t)=$ __[c1*exp(t)]
$x_2(t)=$ __[c2*exp(2*t)]
```

#### b) Startverdiproblemet

```{math-exercise}
#| label: uke07-opp5b-startverdi
#| caption: Løs y′ = Ay, y(0) = (2, 0)
#| mode: equivalent
#| vars: t
#| field-labels: koeffisient foran e^t, koeffisient foran e^(2t), y_1(t), y_2(t)
#| context: uke07-diagonal-context, uke07-opp5-context

Den generelle løsningen er $y(t)=c_1e^{t}\begin{pmatrix}1\\1\end{pmatrix}+c_2e^{2t}\begin{pmatrix}1\\2\end{pmatrix}$. Finn $c_1$ og $c_2$ når $y(0)=(2,0)$, og skriv opp løsningen.

$c_1=$ _[4]
$c_2=$ _[-2]
$y_1(t)=$ ___[4*exp(t) - 2*exp(2*t)]
$y_2(t)=$ ___[4*exp(t) - 4*exp(2*t)]
```

#### c) En andreordens ligning

```{math-exercise}
#| label: uke07-opp5c-andreorden
#| caption: Fra andreordens ligning til system
#| mode: equivalent
#| vars: t
#| field-labels: M_11, M_12, M_21, M_22, z(t)
#| context: uke07-diagonal-context, uke07-opp5-context

Ligningen $z''-3z'+2z=0$ med $z(0)=2$, $z'(0)=0$ skrives som $y'=My$ med $y=(z,z')$. Finn $M$ og løsningen $z(t)$.

$M=$ mat[0, 1; -2, 3]

$z(t)=$ ___[4*exp(t) - 2*exp(2*t)]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 5"}

**a)** $x'=Dx$ er de to frakoblede ligningene $x_1'=x_1$ og $x_2'=2x_2$, med
løsninger $x_1=c_1e^{t}$ og $x_2=c_2e^{2t}$.

**b)** Med $y=Px$ blir $y'=Px'=PDx=PDP^{-1}y=Ay$. Altså er

$$
y(t)=P\begin{pmatrix}c_1e^{t}\\c_2e^{2t}\end{pmatrix}
=c_1e^{t}\begin{pmatrix}1\\1\end{pmatrix}+c_2e^{2t}\begin{pmatrix}1\\2\end{pmatrix}.
$$

Merk at egenvektoren $(1,1)$ hører til $e^{t}$ og $(1,2)$ til $e^{2t}$, i samme
rekkefølge som i $P$ og $D$. Startverdien gir
$c_1+c_2=2$, $c_1+2c_2=0$, altså $c_2=-2$ og $c_1=4$:

$$
y(t)=4e^{t}\begin{pmatrix}1\\1\end{pmatrix}-2e^{2t}\begin{pmatrix}1\\2\end{pmatrix}
=\begin{pmatrix}4e^t-2e^{2t}\\4e^t-4e^{2t}\end{pmatrix}.
$$

**c)** Med $y_1=z$, $y_2=z'$ er $y_1'=y_2$ og $y_2'=z''=-2z+3z'=-2y_1+3y_2$,
så $M=\begin{pmatrix}0&1\\-2&3\end{pmatrix}=A$ og $y(0)=(z(0),z'(0))=(2,0)$.
Dermed er $z(t)=y_1(t)=4e^{t}-2e^{2t}$. Kontroll: $z(0)=2$,
$z'(0)=4-4=0$.

Det karakteristiske polynomet $\lambda^2-3\lambda+2=(\lambda-1)(\lambda-2)$ til
andreordensligningen er det samme som det karakteristiske polynomet til $M$.

**Konklusjon fra flervalgsversjonen:** (i), (ii), (ii) og (i).

:::

Oppgavene bygger på flervalgsoppgavesett 2 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke02-basis-context .math-exercise-context}

**Begreper i denne uken.** En *basis* for et vektorrom (eller underrom) $W$ er
en lineært uavhengig mengde som spenner $W$. Alle basiser for $W$ har like mange
elementer, og dette tallet er *dimensjonen* $\dim W$.

For en $m\times n$-matrise $M$ er

- *radrommet* $\operatorname{Row}M\subseteq\mathbb{R}^n$ spennet av radene,
- *kolonnerommet* $\operatorname{Col}M\subseteq\mathbb{R}^m$ spennet av kolonnene,
- *nullrommet* $\operatorname{Null}M=\{x\in\mathbb{R}^n\mid Mx=0\}$.

Radoperasjoner endrer ikke radrommet, så de ikke-null radene i trappeformen er
en basis for $\operatorname{Row}M$. Pivotkolonnene i den *opprinnelige*
matrisen er en basis for $\operatorname{Col}M$. Rangteoremet sier at
$\operatorname{rang}M+\dim\operatorname{Null}M=n$.

En delmengde $W\subseteq V$ er et *underrom* hvis den inneholder $0$ og er
lukket under addisjon og multiplikasjon med skalar.

:::

### Oppgave 1 – radrom, kolonnerom og nullrom

::: {#uke02-opp1-context .math-exercise-context}

La

$$
M=\begin{pmatrix}-3&-1&2&0\\1&3&-2&-4\\0&-2&1&3\\-4&-1&1&0\end{pmatrix}
$$

over $\mathbb{R}$. Den reduserte trappeformen til $M$ er

$$
\begin{pmatrix}1&0&0&1/3\\0&1&0&-5/3\\0&0&1&-1/3\\0&0&0&0\end{pmatrix}.
$$

Vektorer i $\mathbb{R}^4$ skrives inn som rader eller kolonner i en matrise
med justerbar størrelse. Brøker kan skrives som `1/3`.

:::

#### a) Rangen

```{math-exercise}
#| label: uke02-opp1a-rang
#| caption: Rangen til M
#| mode: equivalent
#| field-labels: rang M, dim Null M
#| context: uke02-basis-context, uke02-opp1-context

Les av fra den reduserte trappeformen.

$\operatorname{rang}M=$ _[3]
$\dim\operatorname{Null}M=$ _[1]
```

#### b) En basis for radrommet

```{math-exercise}
#| label: uke02-opp1b-radrom
#| caption: Basis for radrommet
#| mode: custom
#| context: uke02-basis-context, uke02-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       exact = lambda value: value.xreplace({f: Rational(str(f)) for f in value.atoms(Float)})
#|       R = response["inputs"]["R"]["matrix"].applyfunc(exact)
#|       M = Matrix([[-3, -1, 2, 0], [1, 3, -2, -4], [0, -2, 1, 3], [-4, -1, 1, 0]])
#|       return assess_basis(
#|           R,
#|           axis="rows",
#|           target_dimension=M.rank(),
#|           belongs=lambda vector: (
#|               R.cols == M.cols
#|               and all(v.is_real is True and v.is_finite is True for v in vector)
#|               and M.col_join(vector).rank() == M.rank()
#|           ),
#|           name="R",
#|           space_name="radrommet",
#|       )
#| tests: |
#|   def test(check, symbols):
#|       def score(B):
#|           return check({"inputs": {"R": {"matrix": B}}}, symbols)["score"]
#|       assert score(Matrix([[1, 0, 0, Rational(1, 3)], [0, 1, 0, Rational(-5, 3)], [0, 0, 1, Rational(-1, 3)]])) == 1
#|       assert score(Matrix([[0, 0, 3, -1], [3, 0, 0, 1], [0, 3, 0, -5]])) == 1
#|       assert score(Matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]])) < 1
#|       assert score(zeros(0, 0)) == 0

Finn en basis for $\operatorname{Row}M$. Skriv én basisvektor per rad.

$B=$ mat{name=R, rows=auto, cols=4, initial-rows=1, min-rows=0, max-rows=4}
```

#### c) En basis for kolonnerommet

```{math-exercise}
#| label: uke02-opp1c-kolonnerom
#| caption: Basis for kolonnerommet
#| mode: custom
#| context: uke02-basis-context, uke02-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       exact = lambda value: value.xreplace({f: Rational(str(f)) for f in value.atoms(Float)})
#|       C = response["inputs"]["C"]["matrix"].applyfunc(exact)
#|       M = Matrix([[-3, -1, 2, 0], [1, 3, -2, -4], [0, -2, 1, 3], [-4, -1, 1, 0]])
#|       return assess_basis(
#|           C,
#|           axis="columns",
#|           target_dimension=M.rank(),
#|           belongs=lambda vector: (
#|               C.rows == M.rows
#|               and all(v.is_real is True and v.is_finite is True for v in vector)
#|               and M.row_join(vector).rank() == M.rank()
#|           ),
#|           name="C",
#|           space_name="kolonnerommet",
#|       )
#| tests: |
#|   def test(check, symbols):
#|       def score(B):
#|           return check({"inputs": {"C": {"matrix": B}}}, symbols)["score"]
#|       assert score(Matrix([[-3, -1, 2], [1, 3, -2], [0, -2, 1], [-4, -1, 1]])) == 1
#|       assert score(Matrix([[-3, 2], [1, -2], [0, 1], [-4, 1]])) < 1
#|       assert score(Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]])) < 1

Finn en basis for $\operatorname{Col}M$. Skriv én basisvektor per kolonne.

$B=$ mat{name=C, rows=4, cols=auto, initial-cols=1, min-cols=0, max-cols=4}
```

#### d) En basis for nullrommet

```{math-exercise}
#| label: uke02-opp1d-nullrom
#| caption: Basis for nullrommet
#| mode: custom
#| context: uke02-basis-context, uke02-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       exact = lambda value: value.xreplace({f: Rational(str(f)) for f in value.atoms(Float)})
#|       Z = response["inputs"]["Z"]["matrix"].applyfunc(exact)
#|       M = Matrix([[-3, -1, 2, 0], [1, 3, -2, -4], [0, -2, 1, 3], [-4, -1, 1, 0]])
#|       return assess_basis(
#|           Z,
#|           axis="columns",
#|           target_dimension=M.cols - M.rank(),
#|           belongs=lambda vector: (
#|               Z.rows == M.cols
#|               and all(v.is_real is True and v.is_finite is True for v in vector)
#|               and M * vector == zeros(M.rows, 1)
#|           ),
#|           name="Z",
#|           space_name="nullrommet",
#|       )
#| tests: |
#|   def test(check, symbols):
#|       def score(B):
#|           return check({"inputs": {"Z": {"matrix": B}}}, symbols)["score"]
#|       assert score(Matrix([Rational(-1, 3), Rational(5, 3), Rational(1, 3), 1])) == 1
#|       assert score(Matrix([-1, 5, 1, 3])) == 1
#|       assert score(Matrix([[0, -1], [0, 5], [0, 1], [0, 3]])) < 1

Finn en basis for $\operatorname{Null}M$. Skriv én basisvektor per kolonne.

$B=$ mat{name=Z, rows=4, cols=auto, initial-cols=1, min-cols=0, max-cols=4}
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** Den reduserte trappeformen har tre pivoter (i kolonne 1, 2 og 3), så
$\operatorname{rang}M=3$. Rangteoremet gir
$\dim\operatorname{Null}M=4-3=1$.

**b)** Radoperasjoner bevarer radrommet, så de tre ikke-null radene

$$
(1,0,0,\tfrac13),\quad(0,1,0,-\tfrac53),\quad(0,0,1,-\tfrac13)
$$

er en basis for $\operatorname{Row}M$. Ganger vi hver av dem med $3$ og bytter
rekkefølge, får vi $(0,0,3,-1)$, $(3,0,0,1)$ og $(0,3,0,-5)$, som også er en
basis: skalering med et tall $\neq0$ endrer ikke spennet eller uavhengigheten.

Derimot er $\{(1,0,0,0),(0,1,0,0),(0,0,1,0)\}$ **ikke** en basis.
For eksempel er $(1,0,0,0)$ ikke i radrommet: alle vektorer i
$\operatorname{Row}M$ står vinkelrett på nullromsvektoren $(-1,5,1,3)$, men
$(1,0,0,0)\cdot(-1,5,1,3)=-1\neq0$.

**c)** Pivotene står i kolonne 1, 2 og 3, så de tilsvarende kolonnene i den
*opprinnelige* matrisen er en basis for kolonnerommet:

$$
\left\{\begin{pmatrix}-3\\1\\0\\-4\end{pmatrix},
\begin{pmatrix}-1\\3\\-2\\-1\end{pmatrix},
\begin{pmatrix}2\\-2\\1\\1\end{pmatrix}\right\}.
$$

To vektorer kan ikke være nok, siden $\dim\operatorname{Col}M=3$. Kolonnene i
trappeformen, $e_1,e_2,e_3$, spenner et *annet* rom: radoperasjoner endrer
kolonnerommet. For eksempel står alle kolonnene i $M$ vinkelrett på
$y=(1,3,4,0)$ (sjekk!), men $e_1\cdot y=1\neq0$, så $e_1\notin\operatorname{Col}M$.

**d)** Fra trappeformen: $x_1=-\tfrac13x_4$, $x_2=\tfrac53x_4$,
$x_3=\tfrac13x_4$, med $x_4=t$ fri. Altså er

$$
\operatorname{Null}M=\operatorname{span}\left\{\begin{pmatrix}-1/3\\5/3\\1/3\\1\end{pmatrix}\right\}
=\operatorname{span}\left\{\begin{pmatrix}-1\\5\\1\\3\end{pmatrix}\right\}.
$$

En mengde som inneholder nullvektoren, er lineært avhengig og kan derfor
aldri være en basis.

**Konklusjon fra flervalgsversjonen:** radrommet: (i) og (ii);
kolonnerommet: (i); nullrommet: (i) og (ii).

:::

### Oppgave 2 – summer, unioner og snitt av underrom

::: {#uke02-opp2-context .math-exercise-context}

La $V$ være et vektorrom med to underrom $W_1$ og $W_2$. Vi ser på

$$
\begin{aligned}
W_1+W_2&=\{w_1+w_2\mid w_1\in W_1,\ w_2\in W_2\},\\
W_1\cup W_2&=\{w\in V\mid w\in W_1\text{ eller }w\in W_2\},\\
W_1\cap W_2&=\{w\in V\mid w\in W_1\text{ og }w\in W_2\}.
\end{aligned}
$$

:::

#### a) Unionen er vanligvis ikke et underrom

```{math-exercise}
#| label: uke02-opp2a-union
#| caption: Et moteksempel i planet
#| mode: custom
#| field-labels: u_1, u_2, w_1, w_2
#| context: uke02-basis-context, uke02-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       u1, u2, w1, w2 = response["expressions"][:4]
#|       if simplify(u2) != 0:
#|           return {"correct": False, "feedback": "u skal ligge på x-aksen, altså i W_1."}
#|       if simplify(w1) != 0:
#|           return {"correct": False, "feedback": "w skal ligge på y-aksen, altså i W_2."}
#|       if simplify(u1) == 0 or simplify(w2) == 0:
#|           return {"correct": False, "feedback": "Summen u + w ligger da på en av aksene. Prøv vektorer som begge er forskjellige fra null."}
#|       return {"correct": True}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(1), Integer(0), Integer(0), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(0), Integer(0), Integer(0)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(1), Integer(0), Integer(1)]}, symbols)["correct"]

I $V=\mathbb{R}^2$, la $W_1$ være $x$-aksen og $W_2$ være $y$-aksen. Finn $u=(u_1,u_2)\in W_1$ og $w=(w_1,w_2)\in W_2$ slik at $u+w\notin W_1\cup W_2$.

$u_1=$ _[]
$u_2=$ _[]
$w_1=$ _[]
$w_2=$ _[]
```

#### b) Dimensjonen til en direkte sum

```{math-exercise}
#| label: uke02-opp2b-dimensjon
#| caption: Når snittet er {0}
#| mode: equivalent
#| field-labels: dim(W_1 + W_2), antall vektorer i B_1 ∪ B_2
#| context: uke02-basis-context, uke02-opp2-context

La $V=\mathbb{R}^6$, og anta at $\dim W_1=2$, $\dim W_2=3$ og $W_1\cap W_2=\{0\}$. La $\mathcal{B}_1$ og $\mathcal{B}_2$ være basiser for henholdsvis $W_1$ og $W_2$.

$\dim(W_1+W_2)=$ _[5]
Antall vektorer i $\mathcal{B}_1\cup\mathcal{B}_2$: _[5]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**$W_1+W_2$ er alltid et underrom.** $0=0+0\in W_1+W_2$. Hvis
$x=w_1+w_2$ og $y=w_1'+w_2'$, er
$x+y=(w_1+w_1')+(w_2+w_2')\in W_1+W_2$ og $rx=rw_1+rw_2\in W_1+W_2$, fordi
$W_1$ og $W_2$ er lukket under operasjonene.

**$W_1\cap W_2$ er alltid et underrom.** $0$ ligger i begge. Hvis $x,y$
ligger i begge, ligger $x+y$ og $rx$ i begge.

**a) $W_1\cup W_2$ er vanligvis ikke et underrom.** Med $u=(1,0)\in W_1$ og
$w=(0,1)\in W_2$ er $u+w=(1,1)$, som ikke ligger på noen av aksene. Unionen er
altså ikke lukket under addisjon. (Den er et underrom bare når
$W_1\subseteq W_2$ eller $W_2\subseteq W_1$.)

**b)** Hvis $W_1\cap W_2=\{0\}$, er $\mathcal{B}_1\cup\mathcal{B}_2$ en basis
for $W_1+W_2$:

- *Spenner:* hver $w_1+w_2$ er en kombinasjon av vektorene i $\mathcal{B}_1$
  pluss en kombinasjon av vektorene i $\mathcal{B}_2$.
- *Uavhengig:* anta $\sum a_ib_i+\sum c_jd_j=0$ med $b_i\in\mathcal{B}_1$,
  $d_j\in\mathcal{B}_2$. Da er $\sum a_ib_i=-\sum c_jd_j$ en vektor i både
  $W_1$ og $W_2$, altså lik $0$. Siden $\mathcal{B}_1$ og $\mathcal{B}_2$ er
  uavhengige hver for seg, er alle $a_i$ og $c_j$ null.

Dermed er $\dim(W_1+W_2)=2+3=5$, og $\mathcal{B}_1\cup\mathcal{B}_2$ har
$5$ vektorer (de to basisene har ingen felles vektorer, siden $0$ aldri er med
i en basis). Generelt gjelder
$\dim(W_1+W_2)=\dim W_1+\dim W_2-\dim(W_1\cap W_2)$.

**Konklusjon fra flervalgsversjonen:** (i) og (iii) er alltid underrom, og
utsagnet om $\mathcal{B}_1\cup\mathcal{B}_2$ er sant.

:::

### Oppgave 3 – en matrise med for få egenvektorer

::: {#uke02-opp3-context .math-exercise-context}

La

$$
A=\begin{pmatrix}2&1&0\\0&2&1\\0&0&2\end{pmatrix}.
$$

Det karakteristiske polynomet er $p(\lambda)=\det(A-\lambda I)$. Egenrommet til
en egenverdi $\lambda$ er $\operatorname{Null}(A-\lambda I)$. I svarfeltene
skriver du variabelen som `x` i stedet for $\lambda$.

:::

#### a) Det karakteristiske polynomet

```{math-exercise}
#| label: uke02-opp3a-karpol
#| caption: Karakteristisk polynom
#| mode: equivalent
#| vars: x
#| field-labels: p(x)
#| context: uke02-basis-context, uke02-opp3-context

Regn ut $p(x)=\det(A-xI)$.

$p(x)=$ __[(2-x)**3]
```

#### b) Egenrommet

```{math-exercise}
#| label: uke02-opp3b-egenrom
#| caption: Egenrom og egenvektorer
#| mode: custom
#| field-labels: dimensjonen til egenrommet, v_1, v_2, v_3
#| context: uke02-basis-context, uke02-opp3-context
#| checker: |
#|   def check(response, symbols):
#|       d, v1, v2, v3 = response["expressions"][:4]
#|       v = Matrix([v1, v2, v3])
#|       A = Matrix([[2, 1, 0], [0, 2, 1], [0, 0, 2]])
#|       dim_ok = simplify(d - 1) == 0
#|       vec_ok = v != zeros(3, 1) and simplify((A - 2*eye(3)) * v) == zeros(3, 1)
#|       return {"score": (int(dim_ok) + int(vec_ok)) / 2}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(1), Integer(1), Integer(0), Integer(0)]}, symbols)["score"] == 1
#|       assert check({"expressions": [Integer(1), Integer(-4), Integer(0), Integer(0)]}, symbols)["score"] == 1
#|       assert check({"expressions": [Integer(3), Integer(1), Integer(0), Integer(0)]}, symbols)["score"] == 0.5
#|       assert check({"expressions": [Integer(1), Integer(0), Integer(1), Integer(0)]}, symbols)["score"] == 0.5

Den eneste egenverdien er $\lambda=2$. Hva er dimensjonen til egenrommet, og hva er en egenvektor $v=(v_1,v_2,v_3)$?

$\dim\operatorname{Null}(A-2I)=$ _[]
$v_1=$ _[]
$v_2=$ _[]
$v_3=$ _[]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

**a)** $A-\lambda I$ er øvre triangulær, så determinanten er produktet av
diagonalelementene:

$$
p(\lambda)=(2-\lambda)^3=8-12\lambda+6\lambda^2-\lambda^3 .
$$

Begge skrivemåtene er det samme polynomet. (Polynomet $8-4\lambda+2\lambda^3$
er noe annet, for eksempel har det ledende koeffisient $2$, ikke $-1$.)

**b)** Egenverdien $\lambda=2$ har algebraisk multiplisitet $3$. Egenrommet er

$$
A-2I=\begin{pmatrix}0&1&0\\0&0&1\\0&0&0\end{pmatrix},\qquad
(A-2I)v=0\iff v_2=0,\ v_3=0 .
$$

Altså er $\operatorname{Null}(A-2I)=\operatorname{span}\{(1,0,0)\}$, med
dimensjon $1$. Matrisen har bare **én** lineært uavhengig egenvektor, og kan
derfor ikke diagonaliseres. Dette er et viktig eksempel: geometrisk
multiplisitet ($1$) kan være mindre enn algebraisk multiplisitet ($3$).

**Konklusjon fra flervalgsversjonen:** (i) og (ii) er det karakteristiske
polynomet, og $A$ har én lineært uavhengig egenvektor.

:::

### Oppgave 4 – symmetriske matriser

::: {#uke02-opp4-context .math-exercise-context}

En $n\times n$-matrise $M$ er *symmetrisk* hvis $M=M^T$. Regneregler for
transponering: $(A+B)^T=A^T+B^T$, $(AB)^T=B^TA^T$, $(rA)^T=rA^T$ og
$(A^T)^T=A$.

:::

#### a) Produkter og summer

```{math-exercise}
#| label: uke02-opp4a-produkt
#| caption: Regn ut BBᵀ
#| mode: equivalent
#| context: uke02-basis-context, uke02-opp4-context

La $B=\begin{pmatrix}1&2\\0&3\end{pmatrix}$, som *ikke* er symmetrisk. Regn ut $BB^T$.

$BB^T=$ mat[5, 6; 6, 9]
```

#### b) Dimensjonen til et egenrom

```{math-exercise}
#| label: uke02-opp4b-egenrom
#| caption: Egenrom fra en diagonalisering
#| mode: equivalent
#| field-labels: dimensjonen til egenrommet for 3, dimensjonen til egenrommet for 1
#| context: uke02-basis-context, uke02-opp4-context

La $M$ være en symmetrisk $3\times3$-matrise, og anta at det fins en invertibel $P$ slik at $P^{-1}MP=\begin{pmatrix}3&0&0\\0&3&0\\0&0&1\end{pmatrix}$. Hva er dimensjonene til egenrommene?

Egenverdien $3$: _[2]
Egenverdien $1$: _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

**Alle tre matrisene $M+M^T$, $MM^T$ og $rM$ er symmetriske** (og de to første
er symmetriske for *alle* kvadratiske $M$):

$$
(M+M^T)^T=M^T+M,\qquad (MM^T)^T=(M^T)^TM^T=MM^T,\qquad (rM)^T=rM^T=rM .
$$

**a)**

$$
BB^T=\begin{pmatrix}1&2\\0&3\end{pmatrix}\begin{pmatrix}1&0\\2&3\end{pmatrix}
=\begin{pmatrix}5&6\\6&9\end{pmatrix},
$$

som er symmetrisk selv om $B$ ikke er det.

**b)** La $D=P^{-1}MP$. Da er $MP=PD$, så kolonnene $p_1,p_2,p_3$ i $P$
oppfyller $Mp_1=3p_1$, $Mp_2=3p_2$ og $Mp_3=p_3$. Kolonnene er uavhengige fordi
$P$ er invertibel. Dermed er $p_1,p_2$ to uavhengige egenvektorer for $3$.
Egenrommet for $3$ kan ikke ha dimensjon $3$, for da ville $M=3I$ og $D=3I$.
Altså er dimensjonen $2$, og egenrommet for $1$ har dimensjon $1$.

Kort sagt: i en diagonalisering er dimensjonen til et egenrom lik antall
ganger egenverdien står på diagonalen.

**Konklusjon fra flervalgsversjonen:** (i), (ii) og (iii) er symmetriske, og
egenrommet for $3$ har dimensjon $2$.

:::

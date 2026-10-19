Oppgavene bygger på flervalgsoppgavesett 1 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke01-vektorrom-context .math-exercise-context}

**Begreper i denne uken.** La $V$ være et vektorrom over $\mathbb{R}$ eller
$\mathbb{C}$, og la $v_1,\dots,v_k\in V$.

- En *lineær kombinasjon* er en vektor på formen $r_1v_1+\dots+r_kv_k$, der
  $r_1,\dots,r_k$ er skalarer.
- *Spennet* $\operatorname{span}\{v_1,\dots,v_k\}$ er mengden av alle lineære
  kombinasjoner av $v_1,\dots,v_k$.
- Mengden $\{v_1,\dots,v_k\}$ er *lineært uavhengig* dersom
  $r_1v_1+\dots+r_kv_k=0$ bare har løsningen $r_1=\dots=r_k=0$. Ellers er den
  *lineært avhengig*, og en løsning der ikke alle $r_i$ er null, kalles en
  *ikke-triviell lineær relasjon*.
- For vektorer i $\mathbb{R}^n$ kan vi sette vektorene inn som kolonner i en
  matrise $A$. Da er $b\in\operatorname{span}$ nøyaktig når $Ax=b$ er
  løsbar, og dimensjonen til spennet er rangen til $A$.

Studentene har TMA4400 som bakgrunn: radreduksjon, rang og løsning av lineære
ligningssystemer antas kjent.

:::

### Oppgave 1 – spenn og lineær avhengighet i $\mathbb{R}^4$

::: {#uke01-opp1-context .math-exercise-context}

La $S=\{v_1,v_2,v_3,v_4\}\subseteq\mathbb{R}^4$, der

$$
v_1=\begin{pmatrix}1\\3\\-4\\2\end{pmatrix},\quad
v_2=\begin{pmatrix}2\\2\\-3\\2\end{pmatrix},\quad
v_3=\begin{pmatrix}1\\-3\\2\\-4\end{pmatrix},\quad
v_4=\begin{pmatrix}-1\\2\\-2\\1\end{pmatrix},
$$

og la

$$
w_1=\begin{pmatrix}-1\\4\\-3\\5\end{pmatrix},\qquad
w_2=\begin{pmatrix}1\\-5\\0\\-5\end{pmatrix}.
$$

:::

#### a) Dimensjonen til spennet

```{math-exercise}
#| label: uke01-opp1a-rang
#| caption: Hvor stort er spennet?
#| mode: equivalent
#| field-labels: dimensjonen til span S
#| context: uke01-vektorrom-context, uke01-opp1-context

Sett $v_1,\dots,v_4$ inn som kolonner i en $4\times4$-matrise og radreduser. Hva er dimensjonen til $\operatorname{span} S$?

$\dim\operatorname{span}S=$ _[3]
```

#### b) En ikke-triviell lineær relasjon

```{math-exercise}
#| label: uke01-opp1b-relasjon
#| caption: Vis at S er lineært avhengig
#| mode: custom
#| field-labels: r_1, r_2, r_3, r_4
#| context: uke01-vektorrom-context, uke01-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       r = Matrix(response["expressions"][:4])
#|       A = Matrix([[1, 2, 1, -1], [3, 2, -3, 2], [-4, -3, 2, -2], [2, 2, -4, 1]])
#|       if r == zeros(4, 1):
#|           return {"correct": False, "feedback": "Den trivielle løsningen r = 0 viser ingenting. Finn en løsning der minst én r_i er forskjellig fra null."}
#|       residual = simplify(A * r)
#|       if residual == zeros(4, 1):
#|           return {"correct": True}
#|       return {"correct": False, "feedback": "Kombinasjonen blir ikke nullvektoren. Regn ut r_1 v_1 + r_2 v_2 + r_3 v_3 + r_4 v_4 komponent for komponent."}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(-7), Integer(6), Integer(1), Integer(6)]}, symbols)["correct"]
#|       assert check({"expressions": [Rational(-7, 6), Integer(1), Rational(1, 6), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(0)] * 4}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1)] * 4}, symbols)["correct"]

Finn skalarer $r_1,r_2,r_3,r_4$, ikke alle lik null, slik at

$$r_1v_1+r_2v_2+r_3v_3+r_4v_4=0.$$

$r_1=$ _[]
$r_2=$ _[]
$r_3=$ _[]
$r_4=$ _[]
```

#### c) Ligger $w_1$ i spennet?

```{math-exercise}
#| label: uke01-opp1c-w1
#| caption: Skriv w₁ som en lineær kombinasjon
#| mode: custom
#| field-labels: r_1, r_2, r_3, r_4
#| context: uke01-vektorrom-context, uke01-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       r = Matrix(response["expressions"][:4])
#|       A = Matrix([[1, 2, 1, -1], [3, 2, -3, 2], [-4, -3, 2, -2], [2, 2, -4, 1]])
#|       w1 = Matrix([-1, 4, -3, 5])
#|       if simplify(A * r - w1) == zeros(4, 1):
#|           return {"correct": True}
#|       return {"correct": False, "feedback": "Kombinasjonen blir ikke w_1. Sjekk hver av de fire komponentene."}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(-1), Integer(1), Integer(-1), Integer(1)]}, symbols)["correct"]
#|       assert check({"expressions": [Rational(1, 6), Integer(0), Rational(-7, 6), Integer(0)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(1), Integer(1), Integer(1)]}, symbols)["correct"]

Finn skalarer slik at $r_1v_1+r_2v_2+r_3v_3+r_4v_4=w_1$. (Svaret er ikke entydig; alle riktige kombinasjoner godtas.)

$r_1=$ _[]
$r_2=$ _[]
$r_3=$ _[]
$r_4=$ _[]
```

#### d) Ligger $w_2$ i spennet?

En måte å *bevise* at en vektor ikke ligger i et spenn på, er å finne en vektor
$n$ som står vinkelrett på alle vektorene i $S$, men ikke på $w_2$. Da er
$n\cdot u=0$ for alle $u\in\operatorname{span}S$, mens $n\cdot w_2\neq0$.

```{math-exercise}
#| label: uke01-opp1d-w2
#| caption: Et bevis for at w₂ ikke ligger i span S
#| mode: custom
#| field-labels: n_1, n_2, n_3, n_4
#| context: uke01-vektorrom-context, uke01-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       n = Matrix(response["expressions"][:4])
#|       A = Matrix([[1, 2, 1, -1], [3, 2, -3, 2], [-4, -3, 2, -2], [2, 2, -4, 1]])
#|       w2 = Matrix([1, -5, 0, -5])
#|       orthogonal = simplify(A.T * n) == zeros(4, 1)
#|       separates = simplify((n.T * w2)[0]) != 0
#|       if orthogonal and separates:
#|           return {"correct": True}
#|       if not orthogonal:
#|           return {"correct": False, "feedback": "n står ikke vinkelrett på alle v_i. Løs systemet n · v_i = 0 for i = 1, 2, 3, 4."}
#|       return {"correct": False, "feedback": "n står vinkelrett på alle v_i, men også på w_2, så dette skiller ikke w_2 fra spennet."}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(-1), Integer(-3), Integer(-2), Integer(1)]}, symbols)["correct"]
#|       assert check({"expressions": [Integer(2), Integer(6), Integer(4), Integer(-2)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(0)] * 4}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(0), Integer(0), Integer(0)]}, symbols)["correct"]

Finn en vektor $n=(n_1,n_2,n_3,n_4)$ med $n\cdot v_i=0$ for $i=1,2,3,4$ og $n\cdot w_2\neq0$.

$n_1=$ _[]
$n_2=$ _[]
$n_3=$ _[]
$n_4=$ _[]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

Sett vektorene inn som kolonner i $A=[\,v_1\;v_2\;v_3\;v_4\,]$ og radreduser:

$$
A=\begin{pmatrix}1&2&1&-1\\3&2&-3&2\\-4&-3&2&-2\\2&2&-4&1\end{pmatrix}
\;\sim\;
\begin{pmatrix}1&0&0&\tfrac76\\0&1&0&-1\\0&0&1&-\tfrac16\\0&0&0&0\end{pmatrix}.
$$

**a)** Det er tre pivotkolonner, så $\operatorname{rang}A=3$ og
$\dim\operatorname{span}S=3$. Fire vektorer som spenner et tredimensjonalt rom,
kan ikke være lineært uavhengige.

**b)** Den frie variabelen er $r_4=t$. Fra den reduserte trappeformen får vi
$r_1=-\tfrac76t$, $r_2=t$, $r_3=\tfrac16t$. Med $t=6$:

$$
-7v_1+6v_2+v_3+6v_4=0.
$$

Alle ikke-null multipler av $(-7,6,1,6)$ er riktige svar. Altså er $S$
**lineært avhengig**.

**c)** Radreduser totalmatrisen $[A\mid w_1]$. Den siste raden blir
$(0\;0\;0\;0\mid0)$, så systemet er løsbart, og $w_1\in\operatorname{span}S$.
Én løsning er

$$
-v_1+v_2-v_3+v_4=\begin{pmatrix}-1-1+2-1\\-3+2+3+2\\4-3-2-2\\-2+2+4+1\end{pmatrix}
\!=\!\begin{pmatrix}-1\\4\\-3\\5\end{pmatrix}=w_1 .
$$

Fordi $S$ er avhengig, kan vi legge til et hvilket som helst multiplum av
relasjonen i b), så løsningen er ikke entydig.

**d)** For $[A\mid w_2]$ får den siste raden formen $(0\;0\;0\;0\mid c)$ med
$c\neq0$, så systemet er inkonsistent og $w_2\notin\operatorname{span}S$.
Et kort bevis: $n=(-1,-3,-2,1)$ løser $A^{T}n=0$, altså $n\cdot v_i=0$ for alle
$i$. Da er $n\cdot u=0$ for alle $u\in\operatorname{span}S$, men

$$
n\cdot w_2=-1+15+0-5=9\neq0 .
$$

(Merk at $n\cdot w_1=1-12+6+5=0$, i samsvar med at $w_1$ ligger i spennet.)

**Konklusjon fra flervalgsversjonen:** påstandene «$w_1\in\operatorname{span}S$»
og «$w_2\notin\operatorname{span}S$» er sanne, mens «$S$ er lineært uavhengig»
er usann.

:::

### Oppgave 2 – matriser som vektorer

::: {#uke01-opp2-context .math-exercise-context}

La $M_2(\mathbb{R})$ være mengden av alle $2\times2$-matriser med reelle
elementer, med vanlig matriseaddisjon og multiplikasjon med skalar
(elementvis). Med disse operasjonene er $M_2(\mathbb{R})$ et reelt vektorrom.

La

$$
S=\left\{
B_1=\begin{pmatrix}2&1\\1&2\end{pmatrix},\;
B_2=\begin{pmatrix}3&-2\\-2&3\end{pmatrix},\;
B_3=\begin{pmatrix}-4&5\\5&-4\end{pmatrix}
\right\}\subseteq M_2(\mathbb{R}).
$$

:::

#### a) Dimensjonen til $M_2(\mathbb{R})$

```{math-exercise}
#| label: uke01-opp2a-dim
#| caption: Hvor mange tall trengs for å beskrive en 2×2-matrise?
#| mode: equivalent
#| field-labels: dim M_2(R)
#| context: uke01-vektorrom-context, uke01-opp2-context

Hva er dimensjonen til vektorrommet $M_2(\mathbb{R})$?

$\dim M_2(\mathbb{R})=$ _[4]
```

#### b) Lineære kombinasjoner som gir nullmatrisen

```{math-exercise}
#| label: uke01-opp2b-relasjon
#| caption: Finn en ikke-triviell relasjon
#| mode: custom
#| field-labels: r_1, r_2, r_3
#| context: uke01-vektorrom-context, uke01-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       r1, r2, r3 = response["expressions"][:3]
#|       B1 = Matrix([[2, 1], [1, 2]]); B2 = Matrix([[3, -2], [-2, 3]]); B3 = Matrix([[-4, 5], [5, -4]])
#|       if (r1, r2, r3) == (0, 0, 0):
#|           return {"correct": False, "feedback": "Den trivielle løsningen er alltid en løsning. Finn en der ikke alle r_i er null."}
#|       if simplify(r1*B1 + r2*B2 + r3*B3) == zeros(2, 2):
#|           return {"correct": True}
#|       return {"correct": False, "feedback": "Kombinasjonen gir ikke nullmatrisen. Sammenlign element for element."}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(-3), Integer(6), Integer(3)]}, symbols)["correct"]
#|       assert check({"expressions": [Integer(-1), Integer(2), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(2), Integer(3)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(2), Integer(4), Integer(-1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(0), Integer(0), Integer(0)]}, symbols)["correct"]

Finn $r_1,r_2,r_3$, ikke alle null, slik at $r_1B_1+r_2B_2+r_3B_3=\begin{pmatrix}0&0\\0&0\end{pmatrix}$.

$r_1=$ _[]
$r_2=$ _[]
$r_3=$ _[]
```

```{math-exercise}
#| label: uke01-opp2b-dim
#| caption: Dimensjonen til span S
#| mode: equivalent
#| field-labels: dim span S
#| context: uke01-vektorrom-context, uke01-opp2-context

Hva er dimensjonen til $\operatorname{span}S$?

$\dim\operatorname{span}S=$ _[2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**a)** Hver matrise kan skrives entydig som

$$
\begin{pmatrix}a&b\\c&d\end{pmatrix}
=a\begin{pmatrix}1&0\\0&0\end{pmatrix}
+b\begin{pmatrix}0&1\\0&0\end{pmatrix}
+c\begin{pmatrix}0&0\\1&0\end{pmatrix}
+d\begin{pmatrix}0&0\\0&1\end{pmatrix},
$$

så de fire matrisene $E_{11},E_{12},E_{21},E_{22}$ er en basis og
$\dim M_2(\mathbb{R})=4$. Vektorromsaksiomene følger av at addisjon og
skalarmultiplikasjon gjøres elementvis, akkurat som i $\mathbb{R}^4$;
nullvektoren er nullmatrisen, og $-A$ er matrisen med alle fortegn snudd.

**b)** Sammenlign elementene i $r_1B_1+r_2B_2+r_3B_3=0$. Diagonalelementene
gir $2r_1+3r_2-4r_3=0$, og elementene utenfor diagonalen gir
$r_1-2r_2+5r_3=0$ (begge to ganger, på grunn av symmetrien). Løsningen er

$$
(r_1,r_2,r_3)=t(-1,2,1),\qquad t\in\mathbb{R}.
$$

Kontroll med $t=3$: $-3B_1+6B_2+3B_3$ har diagonalelement
$-6+18-12=0$ og element utenfor diagonalen $-3-12+15=0$.

Løsningsrommet er endimensjonalt, så $S$ er avhengig, mens $B_1$ og $B_2$ ikke
er parallelle. Dermed er $\dim\operatorname{span}S=3-1=2$.

**Konklusjon fra flervalgsversjonen:** $M_2(\mathbb{R})$ er et vektorrom, og av
kombinasjonene $(1,2,3)$, $(2,4,-1)$ og $(-3,6,3)$ er det bare $(-3,6,3)$ som
gir nullmatrisen.

:::

### Oppgave 3 – Pauli-matrisene

::: {#uke01-opp3-context .math-exercise-context}

Pauli-matrisene er

$$
\sigma_1=\begin{pmatrix}0&1\\1&0\end{pmatrix},\quad
\sigma_2=\begin{pmatrix}0&-i\\i&0\end{pmatrix},\quad
\sigma_3=\begin{pmatrix}1&0\\0&-1\end{pmatrix},
$$

og $I=\begin{pmatrix}1&0\\0&1\end{pmatrix}$. Vi ser på dem som vektorer i det
komplekse vektorrommet $M_2(\mathbb{C})$, så koeffisientene i lineære
kombinasjoner er komplekse tall.

:::

#### a) En generell kombinasjon

```{math-exercise}
#| label: uke01-opp3a-kombinasjon
#| caption: Regn ut c₁σ₁ + c₂σ₂ + c₃σ₃
#| mode: custom
#| vars: c1, c2, c3
#| context: uke01-vektorrom-context, uke01-opp3-context
#| checker: |
#|   def check(response, symbols):
#|       c1, c2, c3 = symbols["c1"], symbols["c2"], symbols["c3"]
#|       given = [e.subs(Symbol("i"), I) for e in response["expressions"][:4]]
#|       expected = [c3, c1 - I*c2, c1 + I*c2, -c3]
#|       status = [simplify(g - e) == 0 for g, e in zip(given, expected)]
#|       return {"score": sum(status) / 4}
#| tests: |
#|   def test(check, symbols):
#|       c1, c2, c3 = symbols["c1"], symbols["c2"], symbols["c3"]
#|       i = Symbol("i")
#|       assert check({"expressions": [c3, c1 - i*c2, c1 + I*c2, -c3]}, symbols)["score"] == 1
#|       assert check({"expressions": [c3, c1 + i*c2, c1 - i*c2, -c3]}, symbols)["score"] == 0.5

Skriv $c_1\sigma_1+c_2\sigma_2+c_3\sigma_3$ som én matrise. Skriv `c1`, `c2`, `c3` for koeffisientene og `i` (eller `I`) for den imaginære enheten.

$c_1\sigma_1+c_2\sigma_2+c_3\sigma_3=$ mat[c3, c1-I*c2; c1+I*c2, -c3]
```

#### b) Ligger $I$ i spennet?

```{math-exercise}
#| label: uke01-opp3b-sporet
#| caption: Sammenlign diagonalelementene
#| mode: equivalent
#| field-labels: summen av diagonalelementene
#| context: uke01-vektorrom-context, uke01-opp3-context

Bruk svaret fra a). Hva er summen av de to diagonalelementene i $c_1\sigma_1+c_2\sigma_2+c_3\sigma_3$ (uansett valg av $c_1,c_2,c_3$)?

Summen av diagonalelementene: _[0]
```

#### c) Koordinater i basisen $\{I,\sigma_1,\sigma_2,\sigma_3\}$

```{math-exercise}
#| label: uke01-opp3c-koordinater
#| caption: Skriv en matrise i Pauli-basisen
#| mode: custom
#| field-labels: c_0, c_1, c_2, c_3
#| partial-credit: true
#| context: uke01-vektorrom-context, uke01-opp3-context
#| checker: |
#|   def check(response, symbols):
#|       given = [e.subs(Symbol("i"), I) for e in response["expressions"][:4]]
#|       expected = [2, 2, 1, -1]
#|       status = [simplify(g - e) == 0 for g, e in zip(given, expected)]
#|       return {"score": sum(status) / 4}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(2), Integer(2), Integer(1), Integer(-1)]}, symbols)["score"] == 1
#|       assert check({"expressions": [Integer(2), Integer(2), Integer(-1), Integer(-1)]}, symbols)["score"] == 0.75

Finn $c_0,c_1,c_2,c_3\in\mathbb{C}$ slik at

$$
c_0I+c_1\sigma_1+c_2\sigma_2+c_3\sigma_3=\begin{pmatrix}1&2-i\\2+i&3\end{pmatrix}.
$$

$c_0=$ _[]
$c_1=$ _[]
$c_2=$ _[]
$c_3=$ _[]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

**a)**

$$
c_1\sigma_1+c_2\sigma_2+c_3\sigma_3
=\begin{pmatrix}c_3&c_1-ic_2\\c_1+ic_2&-c_3\end{pmatrix}.
$$

**b)** Diagonalelementene er $c_3$ og $-c_3$, med sum $0$. Matrisen $I$ har
diagonalelementer med sum $2$. Skulle $I=c_1\sigma_1+c_2\sigma_2+c_3\sigma_3$,
måtte vi ha $c_3=1$ og $-c_3=1$ samtidig, noe som er umulig. Altså er
$I\notin\operatorname{span}\{\sigma_1,\sigma_2,\sigma_3\}$.

**c)** Med $c_0I$ i tillegg blir den generelle kombinasjonen

$$
\begin{pmatrix}c_0+c_3&c_1-ic_2\\c_1+ic_2&c_0-c_3\end{pmatrix}.
$$

For en vilkårlig matrise $\begin{pmatrix}a&b\\c&d\end{pmatrix}$ får vi den
entydige løsningen

$$
c_0=\frac{a+d}{2},\quad c_3=\frac{a-d}{2},\quad c_1=\frac{b+c}{2},\quad
c_2=\frac{c-b}{2i}.
$$

Her er $a=1$, $b=2-i$, $c=2+i$, $d=3$, så $c_0=2$, $c_3=-1$, $c_1=2$ og
$c_2=\dfrac{2i}{2i}=1$.

Siden *hver* matrise i $M_2(\mathbb{C})$ har nøyaktig én slik representasjon
(spesielt nullmatrisen bare den trivielle), er $\{I,\sigma_1,\sigma_2,\sigma_3\}$
en basis for $M_2(\mathbb{C})$, og spesielt lineært uavhengig.

**Konklusjon fra flervalgsversjonen:** «$I\in\operatorname{span}\{\sigma_1,\sigma_2,\sigma_3\}$»
er usann, mens «$\{I,\sigma_1,\sigma_2,\sigma_3\}$ er lineært uavhengig» er sann.

:::

### Oppgave 4 – funksjoner som vektorer

::: {#uke01-opp4-context .math-exercise-context}

La $V$ være det komplekse vektorrommet av alle funksjoner $f:[0,1)\to\mathbb{C}$,
med punktvis addisjon og multiplikasjon med skalar. Nullvektoren i $V$ er
nullfunksjonen. To funksjoner er like når de har samme verdi for *alle*
$x\in[0,1)$.

Vi ser på mengdene

$$
A=\{e^{-2\pi ix},\,1,\,e^{2\pi ix}\}\qquad\text{og}\qquad
B=\{e^{-2\pi ix},\,0,\,e^{2\pi ix}\}.
$$

:::

#### a) Et ligningssystem fra tre punkter

```{math-exercise}
#| label: uke01-opp4a-system
#| caption: Sett inn x = 0, 1/4 og 1/2
#| mode: custom
#| field-labels: M_11, M_12, M_13, M_21, M_22, M_23, M_31, M_32, M_33
#| partial-credit: true
#| context: uke01-vektorrom-context, uke01-opp4-context
#| checker: |
#|   def check(response, symbols):
#|       given = [e.subs(Symbol("i"), I) for e in response["expressions"][:9]]
#|       expected = [1, 1, 1, -I, 1, I, -1, 1, -1]
#|       status = [simplify(g - e) == 0 for g, e in zip(given, expected)]
#|       return {"score": sum(status) / 9}
#| tests: |
#|   def test(check, symbols):
#|       i = Symbol("i")
#|       assert check({"expressions": [Integer(1), Integer(1), Integer(1), -i, Integer(1), i, Integer(-1), Integer(1), Integer(-1)]}, symbols)["score"] == 1
#|       assert check({"expressions": [exp(0), Integer(1), Integer(1), exp(-I*pi/2), Integer(1), exp(I*pi/2), exp(-I*pi), Integer(1), exp(I*pi)]}, symbols)["score"] == 1

Anta at $c_1e^{-2\pi ix}+c_2\cdot1+c_3e^{2\pi ix}=0$ for alle $x\in[0,1)$. Setter vi inn $x=0$, $x=\tfrac14$ og $x=\tfrac12$, får vi et lineært system $Mc=0$ med $c=(c_1,c_2,c_3)$. Fyll inn koeffisientmatrisen $M$ (rad $k$ svarer til det $k$-te punktet, kolonnene til $c_1,c_2,c_3$). Skriv `i` for den imaginære enheten.

$M=$ mat[1,1,1; -I,1,I; -1,1,-1]
```

#### b) Dimensjonene til spennene

```{math-exercise}
#| label: uke01-opp4b-dim
#| caption: Avhengig eller uavhengig?
#| mode: equivalent
#| field-labels: dim span A, dim span B
#| context: uke01-vektorrom-context, uke01-opp4-context

Bruk a) til å avgjøre om $A$ er lineært uavhengig. Hva er dimensjonene?

$\dim\operatorname{span}A=$ _[3]
$\dim\operatorname{span}B=$ _[2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

**a)** Vi bruker $e^{\pm2\pi i\cdot0}=1$, $e^{\pm2\pi i/4}=e^{\pm i\pi/2}=\pm i$ og
$e^{\pm2\pi i/2}=e^{\pm i\pi}=-1$:

$$
\begin{aligned}
x=0:&\quad c_1+c_2+c_3=0,\\
x=\tfrac14:&\quad -ic_1+c_2+ic_3=0,\\
x=\tfrac12:&\quad -c_1+c_2-c_3=0,
\end{aligned}
\qquad
M=\begin{pmatrix}1&1&1\\-i&1&i\\-1&1&-1\end{pmatrix}.
$$

**b)** Første og tredje ligning gir ved addisjon $2c_2=0$, altså $c_2=0$ og
$c_3=-c_1$. Andre ligning gir da $-ic_1-ic_1=-2ic_1=0$, så $c_1=0$ og
$c_3=0$. Kombinasjonen kan altså bare være nullfunksjonen når alle koeffisientene
er null: $A$ er **lineært uavhengig**, og $\dim\operatorname{span}A=3$.

Mengden $B$ inneholder nullvektoren. Da er $0\cdot e^{-2\pi ix}+1\cdot0+0\cdot e^{2\pi ix}=0$
en ikke-triviell relasjon, så $B$ er **lineært avhengig**. De to andre
funksjonene er uavhengige (samme argument som over med $c_2$ fjernet), så
$\dim\operatorname{span}B=2$.

**Konklusjon fra flervalgsversjonen:** «$A$ er lineært avhengig» er usann,
mens «$B$ er lineært avhengig» er sann. Generelt: *enhver mengde som inneholder
nullvektoren, er lineært avhengig.*

:::

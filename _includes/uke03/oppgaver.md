Oppgavene bygger på flervalgsoppgavesett 3 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke03-lintrans-context .math-exercise-context}

**Begreper i denne uken.** La $T\colon V\to W$ være en lineærtransformasjon.

- *Kjernen* er $\operatorname{Ker}T=\{v\in V\mid T(v)=0\}$, et underrom av $V$.
- *Rekkevidden* (bildet) er $\operatorname{Im}T=\{T(v)\mid v\in V\}$, et
  underrom av $W$.
- $T$ er *injektiv* hvis og bare hvis $\operatorname{Ker}T=\{0\}$, og
  *surjektiv* hvis $\operatorname{Im}T=W$. En *isomorfi* er en lineær
  bijeksjon.
- *Rangteoremet:* hvis $\dim V<\infty$, er
  $\dim\operatorname{Ker}T+\dim\operatorname{Im}T=\dim V$.
- Hvis $\mathcal{B}=\{b_1,\dots,b_n\}$ er en basis for $V$ og
  $v=c_1b_1+\dots+c_nb_n$, er *koordinatvektoren*
  $[v]_{\mathcal{B}}=(c_1,\dots,c_n)$.

$\mathbb{P}_4$ betegner vektorrommet av reelle polynomer i $x$ av grad høyst
$4$. Dimensjonen er $5$, og $\{1,x,x^2,x^3,x^4\}$ er standardbasisen.

:::

### Oppgave 1 – $T(f)=xf'$

::: {#uke03-opp1-context .math-exercise-context}

La $T\colon\mathbb{P}_4\to\mathbb{P}_4$ være gitt ved

$$
T(f(x))=x\,f'(x),
$$

der $f'$ er den deriverte av $f$ med hensyn på $x$.

:::

#### a) Bildet av basisvektorene

```{math-exercise}
#| label: uke03-opp1a-basis
#| caption: T anvendt på xᵏ
#| mode: equivalent
#| vars: x
#| field-labels: T(1), T(x), T(x^2), T(x^3), T(x^4)
#| context: uke03-lintrans-context, uke03-opp1-context

Regn ut $T$ på hver av standardbasisvektorene.

$T(1)=$ __[0]
$T(x)=$ __[x]
$T(x^2)=$ __[2*x**2]
$T(x^3)=$ __[3*x**3]
$T(x^4)=$ __[4*x**4]
```

#### b) Kjerne og rekkevidde

```{math-exercise}
#| label: uke03-opp1b-dim
#| caption: Dimensjonene til kjernen og rekkevidden
#| mode: equivalent
#| field-labels: dim Ker T, dim Im T
#| context: uke03-lintrans-context, uke03-opp1-context

$\dim\operatorname{Ker}T=$ _[1]
$\dim\operatorname{Im}T=$ _[4]
```

```{math-exercise}
#| label: uke03-opp1b-kjerne
#| caption: Et polynom i kjernen
#| mode: custom
#| vars: x
#| field-labels: f(x)
#| context: uke03-lintrans-context, uke03-opp1-context
#| checker: |
#|   def check(response, symbols):
#|       x = symbols["x"]
#|       f = expand(response["expressions"][0])
#|       if not f.is_polynomial(x) or (f != 0 and degree(f, x) > 4):
#|           return {"correct": False, "feedback": "Svaret må være et polynom i x av grad høyst 4."}
#|       if f == 0:
#|           return {"correct": False, "feedback": "Nullpolynomet ligger alltid i kjernen. Finn et polynom som ikke er null."}
#|       return {"correct": expand(x * diff(f, x)) == 0}
#| tests: |
#|   def test(check, symbols):
#|       x = symbols["x"]
#|       assert check({"expressions": [Integer(1)]}, symbols)["correct"]
#|       assert check({"expressions": [Integer(-7)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(0)]}, symbols)["correct"]
#|       assert not check({"expressions": [x]}, symbols)["correct"]

Finn et polynom $f\neq0$ i $\mathbb{P}_4$ med $T(f)=0$.

$f(x)=$ __[]
```

#### c) Hva rangteoremet utelukker

```{math-exercise}
#| label: uke03-opp1c-rangteorem
#| caption: Rangteoremet uten utregning
#| mode: equivalent
#| field-labels: dim Im T når dim Ker T = 1
#| context: uke03-lintrans-context, uke03-opp1-context

Anta bare at $S\colon\mathbb{P}_4\to\mathbb{P}_4$ er lineær og at $\operatorname{Ker}S=\operatorname{span}\{1\}$. Hvilken dimensjon *må* $\operatorname{Im}S$ da ha?

$\dim\operatorname{Im}S=$ _[4]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** $T(x^k)=x\cdot kx^{k-1}=kx^k$. Altså er $T(1)=0$, $T(x)=x$,
$T(x^2)=2x^2$, $T(x^3)=3x^3$ og $T(x^4)=4x^4$. Matrisen til $T$ med hensyn på
standardbasisen er derfor diagonal, med diagonal $(0,1,2,3,4)$.

**b)** For $f=a_0+a_1x+\dots+a_4x^4$ er
$T(f)=a_1x+2a_2x^2+3a_3x^3+4a_4x^4$. Dette er null nøyaktig når
$a_1=a_2=a_3=a_4=0$, altså når $f$ er konstant:

$$
\operatorname{Ker}T=\operatorname{span}\{1\}=\operatorname{span}\{3\}.
$$

(Alle konstanter $\neq0$ spenner det samme rommet.) Rekkevidden består av alle
polynomer uten konstantledd:

$$
\operatorname{Im}T=\operatorname{span}\{x,x^2,x^3,x^4\}=\operatorname{span}\{x,2x^2,3x^3,4x^4\}.
$$

Dimensjonene er $1$ og $4$, i samsvar med rangteoremet $1+4=5$.

Siden $\operatorname{Ker}T\neq\{0\}$, er $T$ ikke injektiv, og siden
$1\notin\operatorname{Im}T$, er $T$ ikke surjektiv. $T$ er **ikke** en
isomorfi, og grunnen er at $T(1)=0$ med $1\neq0$. (At $T(0)=0$ gjelder for
*alle* lineærtransformasjoner og sier ingenting.)

**c)** Rangteoremet gir $\dim\operatorname{Im}S=5-1=4$. Kombinasjoner der
$\operatorname{Ker}=\operatorname{span}\{1\}$ og $\operatorname{Im}$ har
dimensjon $5$ eller $3$ (for eksempel
$\operatorname{span}\{2x^2,3x^3,4x^4\}$), kan derfor ikke forekomme.

**Konklusjon fra flervalgsversjonen:** kjernen er (ii) og (iii), rekkevidden er
(ii) og (iii), $T$ er verken injektiv eller surjektiv, kombinasjonene (i) og (ii)
kan ikke forekomme, og $T$ er ikke en isomorfi fordi $T(1)=0$.

:::

### Oppgave 2 – $T(f)=x^4f(1/x)$

::: {#uke03-opp2-context .math-exercise-context}

La $T\colon\mathbb{P}_4\to\mathbb{P}_4$ være gitt ved

$$
T(f(x))=x^4f(1/x).
$$

Skriv koeffisientene som `a0`, `a1`, …, `a4` i svarene.

:::

#### a) En formel for $T$

```{math-exercise}
#| label: uke03-opp2a-formel
#| caption: T på et generelt polynom
#| mode: equivalent
#| vars: x, a0, a1, a2, a3, a4
#| field-labels: T(f)
#| context: uke03-lintrans-context, uke03-opp2-context

La $f(x)=a_0+a_1x+a_2x^2+a_3x^3+a_4x^4$. Regn ut $T(f)$ som et polynom i $x$.

$T(f)=$ ___[a4 + a3*x + a2*x**2 + a1*x**3 + a0*x**4]
```

#### b) Løs $T(f)=g$

```{math-exercise}
#| label: uke03-opp2b-urbilde
#| caption: Finn et urbilde
#| mode: equivalent
#| vars: x
#| field-labels: f(x)
#| context: uke03-lintrans-context, uke03-opp2-context

Finn $f\in\mathbb{P}_4$ slik at $T(f)=1+2x+3x^2$.

$f(x)=$ ___[3*x**2 + 2*x**3 + x**4]
```

#### c) $T$ to ganger

```{math-exercise}
#| label: uke03-opp2c-invers
#| caption: Hva er T ∘ T?
#| mode: equivalent
#| vars: x
#| field-labels: T(T(f)), dim Ker T, dim Im T
#| context: uke03-lintrans-context, uke03-opp2-context

La $f(x)=2-x+5x^3$. Regn ut $T(T(f))$, og bestem dimensjonene til kjernen og rekkevidden til $T$.

$T(T(f))=$ ___[2 - x + 5*x**3]
$\dim\operatorname{Ker}T=$ _[0]
$\dim\operatorname{Im}T=$ _[5]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**a)** $x^4(1/x)^k=x^{4-k}$, så

$$
T(a_0+a_1x+a_2x^2+a_3x^3+a_4x^4)=a_4+a_3x+a_2x^2+a_1x^3+a_0x^4 .
$$

$T$ snur altså rekkefølgen på koeffisientene. Det viser også at $T(f)$ faktisk
ligger i $\mathbb{P}_4$, og at $T$ er lineær.

**b)** Vi trenger $a_4=1$, $a_3=2$, $a_2=3$, $a_1=a_0=0$, altså
$f=3x^2+2x^3+x^4$.

**c)** Å snu rekkefølgen to ganger gir tilbake det vi startet med:
$T(T(f))=f$ for alle $f$. Med $f=2-x+5x^3$ er $T(f)=5x-x^3+2x^4$ og
$T(T(f))=2-x+5x^3$.

Altså er $T\circ T=\mathrm{id}$, og $T$ er sin egen invers. Da er $T$ en
isomorfi: $\operatorname{Ker}T=\{0\}$ og
$\operatorname{Im}T=\mathbb{P}_4=\operatorname{span}\{1,x,x^2,x^3,x^4\}$.
Siden $\{1,x,2x^2,3x^3,4x^4\}$ også er en basis for $\mathbb{P}_4$, er
$\operatorname{Im}T$ også spennet av den.

Uten å regne ut kjerne og bilde kan vi utelukke kombinasjoner der dimensjonene
ikke summerer til $5$: kjerne $\operatorname{span}\{1+x+x^2+x^3+x^4\}$
(dimensjon 1) med bilde av dimensjon 5, eller kjerne
$\operatorname{span}\{1+x^4,x+x^3,x^2\}$ (dimensjon 3) med bilde
$\operatorname{span}\{x,x^2,x^3\}$ (dimensjon 3).

**Konklusjon fra flervalgsversjonen:** kjernen er (i), rekkevidden er (ii) og
(iii), $T$ er både injektiv og surjektiv, og kombinasjonene (ii) og (iii) kan
ikke forekomme.

:::

### Oppgave 3 – koordinatvektorer i to basiser

::: {#uke03-opp3-context .math-exercise-context}

I $\mathbb{P}_4$ er både

$$
\mathcal{B}_1=\{1,x,x^2,x^3,x^4\}\quad\text{og}\quad
\mathcal{B}_2=\{1,(1+x),(1+x)^2,(1+x)^3,(1+x)^4\}
$$

basiser. La $p(x)=1+x+x^2+x^3+x^4$. Koordinatvektoren er en vektor av
*tall*, ikke av polynomer.

:::

```{math-exercise}
#| label: uke03-opp3-koordinater
#| caption: Koordinatene til p i to basiser
#| mode: equivalent
#| vecdir: row
#| field-labels: B1 komponent 1, B1 komponent 2, B1 komponent 3, B1 komponent 4, B1 komponent 5, B2 komponent 1, B2 komponent 2, B2 komponent 3, B2 komponent 4, B2 komponent 5
#| context: uke03-lintrans-context, uke03-opp3-context

$[p]_{\mathcal{B}_1}=$ vec[1, 1, 1, 1, 1]

$[p]_{\mathcal{B}_2}=$ vec[1, -2, 4, -3, 1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

**$\mathcal{B}_1$:** $p=1\cdot1+1\cdot x+1\cdot x^2+1\cdot x^3+1\cdot x^4$, så
$[p]_{\mathcal{B}_1}=(1,1,1,1,1)$. Svaret har fem komponenter fordi
$\dim\mathbb{P}_4=5$.

**$\mathcal{B}_2$:** Sett $y=1+x$, altså $x=y-1$, og utvid $p$ i potenser av
$y$:

$$
\begin{aligned}
p&=1+(y-1)+(y-1)^2+(y-1)^3+(y-1)^4\\
&=1+(y-1)+(y^2-2y+1)+(y^3-3y^2+3y-1)+(y^4-4y^3+6y^2-4y+1)\\
&=1-2y+4y^2-3y^3+y^4 .
\end{aligned}
$$

Altså er $[p]_{\mathcal{B}_2}=(1,-2,4,-3,1)$. Kontroll: $x=0$, dvs. $y=1$, gir
$1-2+4-3+1=1=p(0)$.

**Konklusjon fra flervalgsversjonen:** (i) for $\mathcal{B}_1$ og (iii) for
$\mathcal{B}_2$.

:::

### Oppgave 4 – når er injektiv det samme som surjektiv?

::: {#uke03-opp4-context .math-exercise-context}

La $T\colon V\to V$ være lineær, der $\dim V=6$. Påstandene

(i) $T$ er injektiv, (ii) $T$ er surjektiv, (iii) $T$ er injektiv og
surjektiv, (iv) $T$ er en isomorfi, (v) $\operatorname{Ker}T=\{0\}$,
(vi) $\operatorname{Im}T=V$

er ekvivalente. Oppgaven går ut på å se hvorfor.

:::

```{math-exercise}
#| label: uke03-opp4-ekvivalens
#| caption: Rangteoremet i begge retninger
#| mode: equivalent
#| field-labels: dim Im T når Ker T = {0}, dim Ker T når Im T = V, dim Im T når dim Ker T = 2
#| context: uke03-lintrans-context, uke03-opp4-context

Hvis $\operatorname{Ker}T=\{0\}$, er $\dim\operatorname{Im}T=$ _[6]
Hvis $\operatorname{Im}T=V$, er $\dim\operatorname{Ker}T=$ _[0]
Hvis $\dim\operatorname{Ker}T=2$, er $\dim\operatorname{Im}T=$ _[4]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

Rangteoremet gir $\dim\operatorname{Ker}T+\dim\operatorname{Im}T=6$.

- (i) $\Leftrightarrow$ (v) gjelder for alle lineærtransformasjoner.
- (v) $\Rightarrow$ (vi): $\dim\operatorname{Im}T=6-0=6$, og et underrom av
  $V$ med samme dimensjon som $V$ er hele $V$.
- (vi) $\Rightarrow$ (v): $\dim\operatorname{Ker}T=6-6=0$.
- (ii) $\Leftrightarrow$ (vi) er definisjonen, og (iii) $\Leftrightarrow$ (iv)
  er definisjonen av isomorfi.

Altså er alle seks påstandene ekvivalente, og **ingen skal ut**. I det siste
feltet viser rangteoremet at $\dim\operatorname{Im}T=4<6$, så en slik $T$ er
verken injektiv eller surjektiv.

Merk: dette bruker at $\dim V<\infty$. På rommet av *alle* polynomer er
derivasjon surjektiv, men ikke injektiv.

:::

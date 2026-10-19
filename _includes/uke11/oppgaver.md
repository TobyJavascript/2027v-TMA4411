Oppgavene bygger på flervalgsoppgavesett 11 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke11-grenser-context .math-exercise-context}

**Begreper i denne uken.**

- $\lim_{(x,y)\to(a,b)}f(x,y)=L$ betyr at $f(x,y)$ er vilkårlig nær $L$ for
  alle $(x,y)\neq(a,b)$ tilstrekkelig nær $(a,b)$ – uansett hvordan vi nærmer
  oss. Gir to veier inn mot punktet ulike grenser, eksisterer ikke grensen.
  Grenser av vektorfunksjoner regnes komponentvis.
- $f$ er *kontinuerlig* i $a$ hvis $\lim_{x\to a}f(x)=f(a)$.
- *Ekstremalverdisetningen:* en kontinuerlig funksjon på en kompakt mengde har
  både maksimum og minimum der.
- Gradienten er $\nabla f=(f_x,f_y,f_z)$. For en enhetsvektor $r$ er den
  retningsderiverte $D_rf(a)=\nabla f(a)\cdot r$.

:::

### Oppgave 1 – grenseverdier

::: {#uke11-opp1-context .math-exercise-context}

Vi ser på grensene når $(x,y)\to(0,0)$ av

$$
F(x,y)=\big(xy,\ (1+x)(1+y)\big),\qquad
G(x,y)=\Big(xy,\ \frac{x^2-y^2}{x^2+y^2}\Big),\qquad
H(x,y)=\frac{\sin(xy)}{xy}.
$$

:::

#### a) En kontinuerlig vektorfunksjon

```{math-exercise}
#| label: uke11-opp1a-F
#| caption: Grensen til F
#| mode: equivalent
#| field-labels: første komponent, andre komponent
#| context: uke11-grenser-context, uke11-opp1-context

$\displaystyle\lim_{(x,y)\to(0,0)}F(x,y)=$ vec[0, 1]
```

#### b) Ulike veier inn mot origo

```{math-exercise}
#| label: uke11-opp1b-G
#| caption: Langs linjer y = kx
#| mode: equivalent
#| vars: k
#| field-labels: andre komponent av G langs y = kx, langs x-aksen, langs y-aksen
#| context: uke11-grenser-context, uke11-opp1-context

Regn ut andre komponent av $G$ langs linjen $y=kx$ (med $x\neq0$), og langs de to aksene.

Langs $y=kx$: __[(1-k**2)/(1+k**2)]
Langs $x$-aksen: _[1]
Langs $y$-aksen: _[-1]
```

#### c) En kjent grense i forkledning

```{math-exercise}
#| label: uke11-opp1c-H
#| caption: Grensen til sin(xy)/(xy)
#| mode: equivalent
#| field-labels: grensen
#| context: uke11-grenser-context, uke11-opp1-context

$\displaystyle\lim_{(x,y)\to(0,0)}\frac{\sin(xy)}{xy}=$ _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** Begge komponentene er polynomer og dermed kontinuerlige, så vi kan sette
inn: $\lim F=(0\cdot0,\ 1\cdot1)=(0,1)$.

**b)** Første komponent går mot $0$. For den andre setter vi inn $y=kx$:

$$
\frac{x^2-k^2x^2}{x^2+k^2x^2}=\frac{1-k^2}{1+k^2}.
$$

Dette avhenger av $k$: langs $x$-aksen ($k=0$) får vi $1$, langs linjen $y=x$
får vi $0$, og langs $y$-aksen ($x=0$) får vi $\frac{-y^2}{y^2}=-1$. Grensen
**eksisterer ikke**, og dermed eksisterer heller ikke grensen til $G$.

**c)** Sett $t=xy$. Når $(x,y)\to(0,0)$, går $t\to0$, og
$\lim_{t\to0}\frac{\sin t}{t}=1$. (Funksjonen er bare definert der
$xy\neq0$, men grensen tas over punktene i definisjonsmengden.)

**Konklusjon fra flervalgsversjonen:** $(0,1)$; eksisterer ikke; $1$.

:::

### Oppgave 2 – kontinuitet og indikatorfunksjoner

::: {#uke11-opp2-context .math-exercise-context}

For en mengde $A\subseteq\mathbb{R}^2$ er indikatorfunksjonen

$$
I_A(x,y)=\begin{cases}1,&(x,y)\in A,\\0,&(x,y)\notin A.\end{cases}
$$

La $S=\{(x,y)\mid x^2+y^2=1\}$ (enhetssirkelen), og

$$
f(x,y)=x^2+y^2,\qquad g(x,y)=I_S(x,y),\qquad h(x,y)=g(x,y)\,(1-x^2-y^2).
$$

Vi undersøker kontinuitet i punktet $(1,0)$.

:::

```{math-exercise}
#| label: uke11-opp2-kontinuitet
#| caption: Hvilken er diskontinuerlig?
#| mode: equivalent
#| field-labels: g(1 0), grensen av g(1+1/n 0), h(x y) for alle (x y), f(1 0)
#| context: uke11-grenser-context, uke11-opp2-context

$g(1,0)=$ _[1]
$\displaystyle\lim_{n\to\infty}g\big(1+\tfrac1n,0\big)=$ _[0]
$h(x,y)=$ _[0] for alle $(x,y)$
$f(1,0)=$ _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

- $f$ er et polynom og derfor kontinuerlig overalt.
- $g(1,0)=1$ fordi $(1,0)\in S$, men punktene $(1+\tfrac1n,0)$ ligger ikke på
  sirkelen, så $g(1+\tfrac1n,0)=0\to0\neq1$. Altså er $g$ **ikke**
  kontinuerlig i $(1,0)$.
- $h$: på sirkelen er $1-x^2-y^2=0$, og utenfor sirkelen er $g=0$. Altså er
  $h(x,y)=0$ for alle $(x,y)$, en konstant funksjon, som er kontinuerlig.

Lærdom: et produkt av en diskontinuerlig og en kontinuerlig funksjon kan godt
være kontinuerlig.

**Konklusjon fra flervalgsversjonen:** (ii).

:::

### Oppgave 3 – gradient og retningsderivert

::: {#uke11-opp3-context .math-exercise-context}

La $f(x,y,z)=x^2yz+xz$ og $a=(1,2,1)$.

:::

```{math-exercise}
#| label: uke11-opp3-gradient
#| caption: Gradient og retningsderivert
#| mode: equivalent
#| field-labels: f_x(a), f_y(a), f_z(a), retningsderivert i retning (1 1 1)/√3, største retningsderiverte
#| context: uke11-grenser-context, uke11-opp3-context

Skriv kvadratrøtter som `sqrt(...)`.

$\nabla f(1,2,1)=$ vec[5, 1, 3]

$D_rf(a)$ for $r=\tfrac{1}{\sqrt3}(1,1,1)$: __[3*sqrt(3)]
Største mulige $D_rf(a)$ over alle enhetsvektorer $r$: __[sqrt(35)]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

$$
f_x=2xyz+z,\qquad f_y=x^2z,\qquad f_z=x^2y+x .
$$

I $(1,2,1)$: $f_x=4+1=5$, $f_y=1$, $f_z=2+1=3$, så
$\nabla f(1,2,1)=(5,1,3)$ – en vektor, ikke et tall.

Den retningsderiverte er et tall:

$$
D_rf(a)=(5,1,3)\cdot\tfrac1{\sqrt3}(1,1,1)=\frac{9}{\sqrt3}=3\sqrt3 .
$$

Den er størst i gradientens retning, og da lik
$|\nabla f(a)|=\sqrt{25+1+9}=\sqrt{35}$.

**Konklusjon fra flervalgsversjonen:** $(5,1,3)$ og $3\sqrt3$.

:::

### Oppgave 4 – ekstremalverdier på kompakte mengder

::: {#uke11-opp4-context .math-exercise-context}

La $f(x,y)=e^{-x^2-y^2}$ på den lukkede enhetsdisken
$A=\{(x,y)\mid x^2+y^2\le1\}$, og $g(x,y)=xy(1-x)(1-y)$ på kvadratet
$B=[0,1]\times[0,1]$. Begge mengdene er kompakte og funksjonene kontinuerlige,
så maksimum og minimum fins.

:::

```{math-exercise}
#| label: uke11-opp4-ekstremal
#| caption: Maksimum og minimum
#| mode: equivalent
#| field-labels: maks f på A, min f på A, maks g på B, x-koordinaten til maks for g, y-koordinaten til maks for g
#| context: uke11-grenser-context, uke11-opp4-context

Skriv $e$ som `E` eller bruk `exp(...)`.

$\max_Af=$ _[1]
$\min_Af=$ __[exp(-1)]
$\max_Bg=$ _[1/16]
Maksimum for $g$ i punktet $(x,y)=$ ( _[1/2] , _[1/2] )
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

**$f$ på $A$:** $f$ avhenger bare av $r^2=x^2+y^2\in[0,1]$, og $e^{-r^2}$ er
avtagende i $r^2$. Maksimum er derfor $e^0=1$ i origo, og minimum er
$e^{-1}=\tfrac1e$ på hele randsirkelen.

**$g$ på $B$:** $g(x,y)=\varphi(x)\varphi(y)$ med $\varphi(t)=t(1-t)\ge0$ på
$[0,1]$. $\varphi$ har maksimum $\tfrac14$ i $t=\tfrac12$, så

$$
\max_Bg=\varphi(\tfrac12)^2=\tfrac1{16}
$$

i punktet $(\tfrac12,\tfrac12)$. På randen av $B$ er $g=0$, som er minimum.

**Konklusjon fra flervalgsversjonen:** $1$, $\tfrac1e$ og $\tfrac1{16}$.

:::

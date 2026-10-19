Oppgavene bygger på flervalgsoppgavesett 4 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke04-matrise-context .math-exercise-context}

**Begreper i denne uken.** La $T\colon V\to V$ være lineær og
$\mathcal{B}=\{b_1,\dots,b_n\}$ en basis for $V$.

- *Matriserepresentasjonen* $[T]_{\mathcal{B}}$ er $n\times n$-matrisen der
  kolonne $j$ er koordinatvektoren $[T(b_j)]_{\mathcal{B}}$. Da er
  $[T(v)]_{\mathcal{B}}=[T]_{\mathcal{B}}[v]_{\mathcal{B}}$.
- *Overgangsmatrisen* fra $\mathcal{B}'$ til $\mathcal{B}$ er matrisen
  $P_{\mathcal{B}\leftarrow\mathcal{B}'}$ der kolonne $j$ er
  $[b'_j]_{\mathcal{B}}$. Den oppfyller
  $[v]_{\mathcal{B}}=P_{\mathcal{B}\leftarrow\mathcal{B}'}[v]_{\mathcal{B}'}$,
  og $P_{\mathcal{B}'\leftarrow\mathcal{B}}=P_{\mathcal{B}\leftarrow\mathcal{B}'}^{-1}$.
- I $\mathbb{R}^n$ er prikkproduktet $x\cdot y=x^Ty$ og normen
  $|x|=\sqrt{x\cdot x}$.

:::

### Oppgave 1 – matrisen til $T(f)=xf'$

::: {#uke04-opp1-context .math-exercise-context}

La $T\colon\mathbb{P}_4\to\mathbb{P}_4$ være gitt ved $T(f(x))=xf'(x)$, som i
uke 3. Vi ser på to basiser for $\mathbb{P}_4$:

$$
\mathcal{B}=\{1,x,x^2,x^3,x^4\},\qquad
\mathcal{B}'=\{1,(1+x),(1+x)^2,(1+x)^3,(1+x)^4\}.
$$

:::

#### a) Standardbasisen

```{math-exercise}
#| label: uke04-opp1a-standard
#| caption: Matrisen med hensyn på B
#| mode: equivalent
#| context: uke04-matrise-context, uke04-opp1-context

Fyll inn $[T]_{\mathcal{B}}$.

$[T]_{\mathcal{B}}=$ mat[0,0,0,0,0; 0,1,0,0,0; 0,0,2,0,0; 0,0,0,3,0; 0,0,0,0,4]
```

#### b) En annen basis

For å finne kolonne $k$ i $[T]_{\mathcal{B}'}$ kan det lønne seg å skrive
$x=(1+x)-1$.

```{math-exercise}
#| label: uke04-opp1b-skift
#| caption: Matrisen med hensyn på B′
#| mode: equivalent
#| context: uke04-matrise-context, uke04-opp1-context

Fyll inn $[T]_{\mathcal{B}'}$.

$[T]_{\mathcal{B}'}=$ mat[0,-1,0,0,0; 0,1,-2,0,0; 0,0,2,-3,0; 0,0,0,3,-4; 0,0,0,0,4]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** $T(x^k)=kx^k$, så $[T(x^k)]_{\mathcal{B}}=k\,e_{k+1}$. Kolonnene gir

$$
[T]_{\mathcal{B}}=\operatorname{diag}(0,1,2,3,4).
$$

(Matrisen med $1/k$ på diagonalen ville svart til en antiderivasjon, og
matrisen med bare enere til $f\mapsto f-f(0)$.)

**b)** Med $y=1+x$ er $x=y-1$ og

$$
T\big((1+x)^k\big)=x\cdot k(1+x)^{k-1}=k\big(y-1\big)y^{k-1}=k\,y^k-k\,y^{k-1}.
$$

Kolonne $k$ (med $k=0,\dots,4$) har altså $k$ på diagonalen og $-k$ rett over:

$$
[T]_{\mathcal{B}'}=\begin{pmatrix}
0&-1&0&0&0\\0&1&-2&0&0\\0&0&2&-3&0\\0&0&0&3&-4\\0&0&0&0&4
\end{pmatrix}.
$$

Begge matrisene er øvre triangulære med samme diagonal, slik de må være:
$[T]_{\mathcal{B}'}=P^{-1}[T]_{\mathcal{B}}P$ har samme egenverdier som
$[T]_{\mathcal{B}}$. Den nedre triangulære varianten i flervalgsversjonen
kommer av å skrive koordinatvektorene som rader i stedet for kolonner.

**Konklusjon fra flervalgsversjonen:** (ii) for $\mathcal{B}$ og (i) for
$\mathcal{B}'$.

:::

### Oppgave 2 – overgangsmatriser i $\mathbb{R}^2$

::: {#uke04-opp2-context .math-exercise-context}

La $\mathcal{B}=\{(1,0),(0,1)\}$ være standardbasisen og
$\mathcal{B}'=\{(1,1),(-1,1)\}$ en annen basis for $\mathbb{R}^2$.

:::

```{math-exercise}
#| label: uke04-opp2a-overgang
#| caption: Overgangsmatrisene begge veier
#| mode: equivalent
#| field-labels: P(B←B′) 11, P(B←B′) 12, P(B←B′) 21, P(B←B′) 22, P(B′←B) 11, P(B′←B) 12, P(B′←B) 21, P(B′←B) 22
#| context: uke04-matrise-context, uke04-opp2-context

$P_{\mathcal{B}\leftarrow\mathcal{B}'}=$ mat[1,-1; 1,1]

$P_{\mathcal{B}'\leftarrow\mathcal{B}}=$ mat[1/2,1/2; -1/2,1/2]
```

```{math-exercise}
#| label: uke04-opp2b-koordinater
#| caption: Bruk overgangsmatrisene
#| mode: equivalent
#| field-labels: v i standardkoordinater 1, v i standardkoordinater 2, w i B′-koordinater 1, w i B′-koordinater 2
#| context: uke04-matrise-context, uke04-opp2-context

Vektoren $v$ har $[v]_{\mathcal{B}'}=(3,2)$, og vektoren $w=(5,1)$ er gitt i standardkoordinater. Finn

$[v]_{\mathcal{B}}=$ vec[1, 5]

$[w]_{\mathcal{B}'}=$ vec[3, -2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

Kolonnene i $P_{\mathcal{B}\leftarrow\mathcal{B}'}$ er $\mathcal{B}'$-vektorene
skrevet i standardkoordinater:

$$
P_{\mathcal{B}\leftarrow\mathcal{B}'}=\begin{pmatrix}1&-1\\1&1\end{pmatrix},
\qquad
P_{\mathcal{B}'\leftarrow\mathcal{B}}=P_{\mathcal{B}\leftarrow\mathcal{B}'}^{-1}
=\frac12\begin{pmatrix}1&1\\-1&1\end{pmatrix}.
$$

(Inversen til $\begin{pmatrix}a&b\\c&d\end{pmatrix}$ er
$\frac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$, her med $ad-bc=2$.)

Koordinater: $[v]_{\mathcal{B}}=\begin{pmatrix}1&-1\\1&1\end{pmatrix}\begin{pmatrix}3\\2\end{pmatrix}=\begin{pmatrix}1\\5\end{pmatrix}$,
som stemmer med $3(1,1)+2(-1,1)=(1,5)$. Og
$[w]_{\mathcal{B}'}=\frac12\begin{pmatrix}1&1\\-1&1\end{pmatrix}\begin{pmatrix}5\\1\end{pmatrix}=\begin{pmatrix}3\\-2\end{pmatrix}$;
kontroll: $3(1,1)-2(-1,1)=(5,1)$.

**Konklusjon fra flervalgsversjonen:** (ii) fra $\mathcal{B}'$ til $\mathcal{B}$
og (i) fra $\mathcal{B}$ til $\mathcal{B}'$.

:::

### Oppgave 3 – prikkproduktet som matriseprodukt

::: {#uke04-opp3-context .math-exercise-context}

Vi tenker på vektorer i $\mathbb{R}^n$ som kolonnevektorer og *definerer*
$x\cdot y=x^Ty$ (matrisemultiplikasjon av en $1\times n$- og en
$n\times1$-matrise). Spørsmålet er hvilke regneregler for vektorer som da følger
direkte av regnereglene for matriser:
$A(B\pm C)=AB\pm AC$, $(A\pm B)C=AC\pm BC$, $(AB)C=A(BC)$, $A+B=B+A$,
$A+(B+C)=(A+B)+C$ og $A(aC)=(aA)C=a(AC)$, og hva vi i tillegg får med reglene
$(tA)^T=tA^T$ og $(AB)^T=B^TA^T$.

:::

```{math-exercise}
#| label: uke04-opp3-produkt
#| caption: aᵀb, bᵀa og abᵀ
#| mode: equivalent
#| field-labels: aᵀb, bᵀa, (abᵀ)₁₁, (abᵀ)₁₂, (abᵀ)₁₃, (abᵀ)₂₁, (abᵀ)₂₂, (abᵀ)₂₃, (abᵀ)₃₁, (abᵀ)₃₂, (abᵀ)₃₃
#| context: uke04-matrise-context, uke04-opp3-context

La $a=(1,2,-1)^T$ og $b=(3,0,2)^T$. Regn ut produktene. Legg merke til hvilke som er tall og hvilke som er matriser.

$a^Tb=$ _[1]
$b^Ta=$ _[1]
$ab^T=$ mat[3,0,2; 6,0,4; -3,0,-2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag og diskusjon til oppgave 3"}

$a^Tb=3+0-2=1$ og $b^Ta=1$, mens $ab^T$ er en $3\times3$-matrise. At
$a^Tb=b^Ta$ er ikke en matriseregel ($AB\neq BA$ generelt), men følger av
transponeringsregelen: $a^Tb$ er en $1\times1$-matrise, så
$a^Tb=(a^Tb)^T=b^T(a^T)^T=b^Ta$.

**Diskusjon.** Reglene (1)–(3) for vektoraddisjon og skalarmultiplikasjon er
reglene for matriser brukt på $n\times1$-matriser. Distributive lover og
skalarregler for prikkproduktet ((4)–(5)) følger av $A(B\pm C)=AB\pm AC$,
$(A\pm B)C=AC\pm BC$ og $A(aC)=(aA)C=a(AC)$ — der vi bruker at
$(ta)^T=ta^T$ og $(a+b)^T=a^T+b^T$ (det siste regnes vanligvis som
selvsagt). Med $(AB)^T=B^TA^T$ får vi i tillegg symmetrien
$a\cdot b=b\cdot a$ i (6), og dermed
$|ta|=\sqrt{t^2\,a\cdot a}=|t||a|$ i (7). Ulikhetene (8) Cauchy–Schwarz og
(9) trekantulikheten følger **ikke** av noen regneregler for matriser: de
krever et eget argument (B1 Sek 4.1).

**Konklusjon fra fasiten:** regnereglene for matriser gir (ii), altså (1)–(5);
med reglene for transponerte kommer (6) og (7) i tillegg.

:::

### Oppgave 4 – regning med vektorer og projeksjon

::: {#uke04-opp4-context .math-exercise-context}

La $u=(1,-2,3)$ og $v=(2,-1,-3)$ i $\mathbb{R}^3$, og la $\theta$ være vinkelen
mellom $u$ og $v$. Projeksjonen av $u$ på $v$ er $tv$, der $t$ er valgt slik
at $(u-tv)\cdot v=0$.

:::

#### a) Grunnleggende regning

```{math-exercise}
#| label: uke04-opp4a-regning
#| caption: Sum, lineærkombinasjon og prikkprodukt
#| mode: equivalent
#| field-labels: (u+v)₁, (u+v)₂, (u+v)₃, (2u−v)₁, (2u−v)₂, (2u−v)₃, u·v
#| context: uke04-matrise-context, uke04-opp4-context

$u+v=$ vec[3, -3, 0]

$2u-v=$ vec[0, -3, 9]

$u\cdot v=$ _[-5]
```

#### b) Lengden til projeksjonen

```{math-exercise}
#| label: uke04-opp4b-projeksjon
#| caption: Projeksjon og cos θ
#| mode: equivalent
#| field-labels: t, |tv|, |u||cos θ|
#| context: uke04-matrise-context, uke04-opp4-context

Finn $t$, og regn ut både $|tv|$ og $|u|\,|\cos\theta|$ eksakt (skriv kvadratrøtter som `sqrt(...)`).

$t=$ _[-5/14]
$|tv|=$ __[5/sqrt(14)]
$|u|\,|\cos\theta|=$ __[5/sqrt(14)]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

**a)** $u+v=(3,-3,0)$, $2u-v=(2-2,-4+1,6+3)=(0,-3,9)$ og
$u\cdot v=2+2-9=-5$. (Flervalgsversjonen hadde $2u-v=(-1,-3,9)$, som er feil i
første komponent.)

**b)** $(u-tv)\cdot v=0$ gir $u\cdot v-t\,v\cdot v=0$, altså

$$
t=\frac{u\cdot v}{v\cdot v}=\frac{-5}{14}.
$$

Da er $|tv|=|t|\,|v|=\dfrac{5}{14}\sqrt{14}=\dfrac{5}{\sqrt{14}}$. Siden
$\cos\theta=\dfrac{u\cdot v}{|u||v|}$, er

$$
|u|\,|\cos\theta|=\frac{|u\cdot v|}{|v|}=\frac{5}{\sqrt{14}}.
$$

Dette gjelder generelt: $|tv|=\dfrac{|u\cdot v|}{|v|^2}|v|=|u|\,|\cos\theta|$.
Lengden av projeksjonen er lengden av den «skyggen» $u$ kaster på linjen
gjennom $v$.

**Konklusjon fra flervalgsversjonen:** (ii) er regnet feil, og
$|tv|=|u||\cos\theta|$.

:::

Oppgavene bygger på flervalgsoppgavesett 5 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke05-indreprodukt-context .math-exercise-context}

**Begreper i denne uken.** Et *indreprodukt* på et reelt vektorrom $V$ er en
funksjon $\langle\cdot,\cdot\rangle\colon V\times V\to\mathbb{R}$ som er
symmetrisk, lineær i hvert argument og positivt definitt
($\langle v,v\rangle>0$ for $v\neq0$).

- Normen er $\|v\|=\sqrt{\langle v,v\rangle}$, og $\|cv\|=|c|\,\|v\|$.
- Vinkelen $\theta\in[0,\pi]$ mellom $u,v\neq0$ er gitt ved
  $\cos\theta=\dfrac{\langle u,v\rangle}{\|u\|\,\|v\|}$.
- $u$ og $v$ er *ortogonale* hvis $\langle u,v\rangle=0$. En mengde er
  *ortogonal* hvis alle par av ulike vektorer er ortogonale, og *ortonormal*
  hvis den i tillegg består av enhetsvektorer.
- Hvis $\{b_1,\dots,b_n\}$ er en ortonormal basis, er
  $v=\sum_i\langle v,b_i\rangle b_i$ og $\|v\|^2=\sum_i\langle v,b_i\rangle^2$.

:::

### Oppgave 1 – regning med indreprodukter

::: {#uke05-opp1-context .math-exercise-context}

La $V$ være et reelt indreproduktrom og $u,v,w\in V$ med

$$
\langle u,v\rangle=1,\qquad\langle u,w\rangle=-1,\qquad\langle v,w\rangle=2.
$$

:::

```{math-exercise}
#| label: uke05-opp1a-linearitet
#| caption: Bruk lineariteten
#| mode: equivalent
#| field-labels: ⟨u | v+w⟩, ⟨u+v/2 | w⟩, ⟨2u+v | w⟩, ⟨u | −2v+w⟩, ⟨u | 2v−w⟩
#| context: uke05-indreprodukt-context, uke05-opp1-context

$\langle u,v+w\rangle=$ _[0]
$\langle u+\tfrac12v,w\rangle=$ _[0]
$\langle 2u+v,w\rangle=$ _[0]
$\langle u,-2v+w\rangle=$ _[-3]
$\langle u,2v-w\rangle=$ _[3]
```

```{math-exercise}
#| label: uke05-opp1b-ortogonal
#| caption: Gjør to vektorer ortogonale
#| mode: equivalent
#| field-labels: s
#| context: uke05-indreprodukt-context, uke05-opp1-context

Finn tallet $s$ slik at $u$ og $v+s\,w$ er ortogonale.

$s=$ _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

Indreproduktet er lineært i hvert argument:

$$
\begin{aligned}
\langle u,v+w\rangle&=\langle u,v\rangle+\langle u,w\rangle=1-1=0,\\
\langle u+\tfrac12v,w\rangle&=\langle u,w\rangle+\tfrac12\langle v,w\rangle=-1+1=0,\\
\langle 2u+v,w\rangle&=2(-1)+2=0,\\
\langle u,-2v+w\rangle&=-2\cdot1+(-1)=-3,\\
\langle u,2v-w\rangle&=2\cdot1-(-1)=3.
\end{aligned}
$$

Altså er $2u+v\perp w$, mens de to andre parene ikke er ortogonale.

For den siste delen: $\langle u,v+sw\rangle=1-s=0$ gir $s=1$, i samsvar med
første linje.

**Konklusjon fra flervalgsversjonen:** $0$, $0$, og bare paret
$2u+v$, $w$ er ortogonalt.

:::

### Oppgave 2 – lengder og vinkler

::: {#uke05-opp2-context .math-exercise-context}

La $V$ være et reelt indreproduktrom og $u,v\in V$ med

$$
\langle u,u\rangle=1,\qquad\langle u,v\rangle=1,\qquad\langle v,v\rangle=1.
$$

Vinkler oppgis i radianer; skriv $\pi$ som `pi`.

:::

```{math-exercise}
#| label: uke05-opp2-norm
#| caption: Norm og vinkel
#| mode: equivalent
#| field-labels: ‖u+v‖, ‖−3u‖, vinkelen mellom u og v, ‖u−v‖
#| context: uke05-indreprodukt-context, uke05-opp2-context

$\|u+v\|=$ _[2]
$\|-3u\|=$ _[3]
Vinkelen mellom $u$ og $v$: _[0]
$\|u-v\|=$ _[0]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

$$
\|u+v\|^2=\langle u,u\rangle+2\langle u,v\rangle+\langle v,v\rangle=1+2+1=4,
$$

så $\|u+v\|=2$. Videre er $\|-3u\|=|-3|\,\|u\|=3$ (en norm er aldri negativ,
og $9$ er kvadratet av normen).

$\cos\theta=\dfrac{1}{1\cdot1}=1$, så $\theta=0$: vektorene peker i samme
retning. Faktisk er $\|u-v\|^2=1-2+1=0$, så $u=v$. Det er tilfellet med
likhet i Cauchy–Schwarz' ulikhet $|\langle u,v\rangle|\le\|u\|\|v\|$.

*Merknad:* I 2026-versjonen var også $\langle u,w\rangle=-1$,
$\langle v,w\rangle=-2$ og $\langle w,w\rangle=1$ oppgitt. Det er umulig:
$|\langle v,w\rangle|=2>1=\|v\|\|w\|$ bryter Cauchy–Schwarz, og siden $u=v$
måtte i tillegg $\langle u,w\rangle=\langle v,w\rangle$. Disse dataene er
derfor tatt ut.

**Konklusjon fra flervalgsversjonen:** lengdene er $2$ og $3$, og vinkelen er $0$.

:::

### Oppgave 3 – ortonormale mengder

::: {#uke05-opp3-context .math-exercise-context}

La $V$ være et reelt indreproduktrom av dimensjon $4$, og la
$\mathcal{B}=\{b_1,b_2,b_3,b_4\}\subset V$.

:::

#### a) Hva må sjekkes?

```{math-exercise}
#| label: uke05-opp3a-betingelser
#| caption: Antall betingelser
#| mode: equivalent
#| field-labels: antall ortogonalitetsbetingelser, antall normbetingelser
#| context: uke05-indreprodukt-context, uke05-opp3-context

For å sjekke at $\mathcal{B}$ er ortonormal, må vi kontrollere ligninger $\langle b_i,b_j\rangle=0$ og ligninger $\|b_i\|=1$. Hvor mange *ulike* betingelser av hver type er det (husk at $\langle b_i,b_j\rangle=\langle b_j,b_i\rangle$)?

Ortogonalitet: _[6]
Norm: _[4]
```

#### b) Koordinater og norm

```{math-exercise}
#| label: uke05-opp3b-koordinater
#| caption: Regn med en ortonormal basis
#| mode: equivalent
#| field-labels: ⟨v | b_2⟩, ‖v‖, ‖u‖
#| context: uke05-indreprodukt-context, uke05-opp3-context

Anta at $\mathcal{B}$ er ortonormal, og la $[v]_{\mathcal{B}}=(1,-2,3,-1)$ og $u=2b_1-b_2-2b_4$. Skriv kvadratrøtter som `sqrt(...)`.

$\langle v,b_2\rangle=$ _[-2]
$\|v\|=$ __[sqrt(15)]
$\|u\|=$ _[3]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

**a)** $\mathcal{B}$ er ortonormal når $\langle b_i,b_j\rangle=0$ for $i\neq j$
og $\|b_i\|=1$ for alle $i$. På grunn av symmetrien holder det å sjekke $i<j$:
det gir $\binom42=6$ ortogonalitetsbetingelser og $4$ normbetingelser.

Kravet «$\langle b_i,b_j\rangle=0$ for alle $i,j$» eller «for $i\le j$» ville
også omfatte $i=j$, altså $\langle b_i,b_i\rangle=0$, som motsier
$\|b_i\|=1$. Riktig formulering er derfor «for alle $i<j$» (eller $i\neq j$).

**b)** $v=b_1-2b_2+3b_3-b_4$, så

$$
\langle v,b_2\rangle=1\cdot0-2\cdot1+3\cdot0-1\cdot0=-2 .
$$

Generelt er koordinatene i en ortonormal basis nettopp indreproduktene
$\langle v,b_i\rangle$. Normene er
$\|v\|=\sqrt{1+4+9+1}=\sqrt{15}$ og
$\|u\|=\sqrt{2^2+(-1)^2+0^2+(-2)^2}=\sqrt9=3$.

**Konklusjon fra flervalgsversjonen:** (iii), $-2$ og $3$.

:::

### Oppgave 4 – ortogonale polynomer

::: {#uke05-opp4-context .math-exercise-context}

La $\mathbb{P}$ være vektorrommet av alle reelle polynomer med indreproduktet

$$
\langle f,g\rangle=\int_{-1}^{1}f(x)g(x)\,dx .
$$

Vi ser på $\mathcal{S}=\{1,\ x,\ x^2-\tfrac13\}$. Skriv kvadratrøtter som
`sqrt(...)`.

:::

#### a) Indreproduktene

```{math-exercise}
#| label: uke05-opp4a-integraler
#| caption: Regn ut integralene
#| mode: equivalent
#| field-labels: ⟨1 | x⟩, ⟨1 | x²−1/3⟩, ⟨x | x²−1/3⟩, ‖1‖², ‖x‖², ‖x²−1/3‖²
#| context: uke05-indreprodukt-context, uke05-opp4-context

$\langle1,x\rangle=$ _[0]
$\langle1,x^2-\tfrac13\rangle=$ _[0]
$\langle x,x^2-\tfrac13\rangle=$ _[0]
$\|1\|^2=$ _[2]
$\|x\|^2=$ _[2/3]
$\|x^2-\tfrac13\|^2=$ _[8/45]
```

#### b) Normalisering

```{math-exercise}
#| label: uke05-opp4b-normalisering
#| caption: Gjør mengden ortonormal
#| mode: equivalent
#| field-labels: c_0, c_1, c_2
#| context: uke05-indreprodukt-context, uke05-opp4-context

Finn positive tall $c_0,c_1,c_2$ slik at $\{c_0\cdot1,\ c_1x,\ c_2(x^2-\tfrac13)\}$ er ortonormal.

$c_0=$ __[1/sqrt(2)]
$c_1=$ __[sqrt(3)/sqrt(2)]
$c_2=$ __[3*sqrt(5)/(2*sqrt(2))]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

**a)** Integralet av en odde funksjon over $[-1,1]$ er null, så
$\langle1,x\rangle=0$ og $\langle x,x^2-\tfrac13\rangle=0$. Videre er

$$
\langle1,x^2-\tfrac13\rangle=\int_{-1}^1\big(x^2-\tfrac13\big)\,dx=\tfrac23-\tfrac23=0,
$$

så $\mathcal{S}$ er **ortogonal**. Normene:

$$
\|1\|^2=2,\qquad \|x\|^2=\int_{-1}^1x^2\,dx=\frac23,\qquad
\|x^2-\tfrac13\|^2=\int_{-1}^1\Big(x^4-\frac23x^2+\frac19\Big)dx=\frac25-\frac49+\frac29=\frac{8}{45}.
$$

Siden ingen av normene er $1$, er $\mathcal{S}$ ikke ortonormal.

**b)** Vi deler hver vektor på normen sin:

$$
c_0=\frac{1}{\sqrt2},\qquad c_1=\sqrt{\frac32}=\frac{\sqrt3}{\sqrt2},\qquad
c_2=\sqrt{\frac{45}{8}}=\frac{3\sqrt5}{2\sqrt2}.
$$

Den normaliserte mengden er
$\Big\{\frac{1}{\sqrt2},\ \frac{\sqrt3}{\sqrt2}x,\ -\frac{\sqrt5}{2\sqrt2}+\frac{3\sqrt5}{2\sqrt2}x^2\Big\}$,
som er ortonormal. Dette er (skalerte) Legendre-polynomer.

**Konklusjon fra flervalgsversjonen:** den første mengden er ortogonal, den
andre er ortonormal.

:::

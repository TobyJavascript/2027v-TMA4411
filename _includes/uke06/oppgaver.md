Oppgavene bygger på flervalgsoppgavesett 6 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke06-projeksjon-context .math-exercise-context}

**Begreper i denne uken.**

- *Gram–Schmidt:* gitt en basis $\{v_1,\dots,v_n\}$, sett $q_1=v_1$ og
  $q_k=v_k-\sum_{j<k}\dfrac{\langle v_k,q_j\rangle}{\langle q_j,q_j\rangle}q_j$.
  Da er $\{q_1,\dots,q_n\}$ ortogonal, og $e_k=q_k/\|q_k\|$ gir en ortonormal
  basis.
- Hvis $\{e_1,\dots,e_m\}$ er en ortonormal basis for et endeligdimensjonalt
  underrom $V\subseteq W$, er den ortogonale projeksjonen
  $P(w)=\operatorname{proj}_V(w)=\sum_{i=1}^m\langle w,e_i\rangle e_i$.
- $w-P(w)\in V^\perp=\{u\in W\mid\langle u,v\rangle=0\text{ for alle }v\in V\}$.
- *Approksimasjonsteoremet:* $\|w-P(w)\|\le\|w-v\|$ for alle $v\in V$.

:::

### Oppgave 1 – Gram–Schmidt for polynomer

::: {#uke06-opp1-context .math-exercise-context}

La $V=\mathbb{P}_3$ (reelle polynomer av grad høyst $3$) med indreproduktet

$$
\langle f,g\rangle=\frac14\int_{-2}^{2}f(x)g(x)\,dx .
$$

Vi bruker Gram–Schmidt på basisen $\{1,x,x^2,x^3\}$ i denne rekkefølgen, med
startvektor $1$. Desimaltall oppgis med minst fire gjeldende siffer.

:::

#### a) De ortogonale polynomene

```{math-exercise}
#| label: uke06-opp1a-gram-schmidt
#| caption: Ortogonale polynomer
#| mode: equivalent
#| vars: x
#| field-labels: q_2, q_3
#| context: uke06-projeksjon-context, uke06-opp1-context

Med $q_0=1$ og $q_1=x$, finn de neste to vektorene fra Gram–Schmidt (uten normalisering).

$q_2(x)=$ __[x**2 - 4/3]
$q_3(x)=$ __[x**3 - 12*x/5]
```

```{math-exercise}
#| label: uke06-opp1a-normer
#| caption: Normaliseringskonstanter
#| mode: equivalent
#| field-labels: 1/‖q_0‖, 1/‖q_1‖, 1/‖q_2‖, 1/‖q_3‖
#| context: uke06-projeksjon-context, uke06-opp1-context

Finn tallene $1/\|q_k\|$ slik at $e_k=q_k/\|q_k\|$ blir ortonormale. Skriv kvadratrøtter som `sqrt(...)`.

$1/\|q_0\|=$ __[1]
$1/\|q_1\|=$ __[sqrt(3)/2]
$1/\|q_2\|=$ __[3*sqrt(5)/8]
$1/\|q_3\|=$ __[5*sqrt(7)/16]
```

#### b) Projeksjonen av $\cos x$

```{math-exercise}
#| label: uke06-opp1b-cos
#| caption: Beste polynomtilnærming til cos x
#| mode: numeric
#| tolerance: 5e-4
#| field-labels: ⟨cos x | e_0⟩, ⟨cos x | e_2⟩, a, b
#| context: uke06-projeksjon-context, uke06-opp1-context

La $W$ være rommet av kontinuerlige funksjoner på $[-2,2]$ med samme indreprodukt. Projeksjonen av $\cos x$ på $V$ er $\langle\cos x,e_0\rangle e_0+\langle\cos x,e_2\rangle e_2$ (de odde leddene forsvinner). Regn ut koeffisientene numerisk, og skriv projeksjonen som $a+bx^2$.

$\langle\cos x,e_0\rangle\approx$ _[0.454649]
$\langle\cos x,e_2\rangle\approx$ _[-0.443743]
$a\approx$ _[0.950769]
$b\approx$ _[-0.372090]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** Over et symmetrisk intervall er integralet av en odde funksjon null.
Derfor er $\langle x,1\rangle=\langle x^2,x\rangle=\langle x^3,1\rangle=\langle x^3,x^2\rangle=0$.
Vi trenger

$$
\langle1,1\rangle=1,\quad \langle x,x\rangle=\langle x^2,1\rangle=\tfrac14\cdot\tfrac{16}{3}=\tfrac43,\quad
\langle x^3,x\rangle=\tfrac14\cdot\tfrac{64}{5}=\tfrac{16}{5}.
$$

Da er

$$
q_2=x^2-\frac{\langle x^2,1\rangle}{\langle1,1\rangle}\cdot1=x^2-\frac43,\qquad
q_3=x^3-\frac{\langle x^3,x\rangle}{\langle x,x\rangle}x=x^3-\frac{16/5}{4/3}x=x^3-\frac{12}{5}x .
$$

Normene er $\|q_0\|^2=1$, $\|q_1\|^2=\tfrac43$, $\|q_2\|^2=\tfrac{64}{45}$ og
$\|q_3\|^2=\tfrac{256}{175}$, så den ortonormale basisen er

$$
\Big\{1,\ \tfrac{\sqrt3}{2}x,\ \tfrac{3\sqrt5}{8}\big(x^2-\tfrac43\big),\
\tfrac{5\sqrt7}{16}\big(x^3-\tfrac{12}{5}x\big)\Big\}.
$$

**b)** $\cos x$ er en like funksjon, så $\langle\cos x,e_1\rangle=\langle\cos x,e_3\rangle=0$.

$$
\langle\cos x,e_0\rangle=\frac14\int_{-2}^2\cos x\,dx=\frac{\sin2}{2}\approx0.45465,
\qquad
\langle\cos x,e_2\rangle=\frac{\sqrt5\,(6\cos2+\sin2)}{8}\approx-0.44374 .
$$

Projeksjonen er

$$
P(\cos x)\approx0.45465-0.44374\cdot\tfrac{3\sqrt5}{8}\big(x^2-\tfrac43\big)
\approx0.95077-0.37209\,x^2 .
$$

Pass på at koeffisientene $\langle\cos x,e_k\rangle$ ganges med de
*normaliserte* $e_k$, ikke med $q_k$ eller $x^k$.

**Konklusjon fra flervalgsversjonen:** mengde (iii) er resultatet av
Gram–Schmidt med normalisering, og projeksjonen er (iii).

:::

### Oppgave 2 – projeksjon som lineærtransformasjon

::: {#uke06-opp2-context .math-exercise-context}

La $W$ være et indreproduktrom og $V\subseteq W$ et underrom med
$\{0\}\neq V\neq W$, og la $P\colon W\to W$ være projeksjonen på $V$. I del b)
er $W=\mathbb{R}^3$ med vanlig prikkprodukt og
$V=\{(x,y,z)\mid x+y+z=0\}$.

:::

#### a) Kjerne og rekkevidde

```{math-exercise}
#| label: uke06-opp2a-dim
#| caption: Rangteoremet for en projeksjon
#| mode: equivalent
#| field-labels: dim Im P, dim Ker P
#| context: uke06-projeksjon-context, uke06-opp2-context

Anta at $\dim W=4$ og $\dim V=3$.

$\dim\operatorname{Im}P=$ _[3]
$\dim\operatorname{Ker}P=$ _[1]
```

#### b) Et konkret eksempel i $\mathbb{R}^3$

```{math-exercise}
#| label: uke06-opp2b-plan
#| caption: Projeksjon på et plan
#| mode: equivalent
#| field-labels: P(w)₁, P(w)₂, P(w)₃, (w−P(w))₁, (w−P(w))₂, (w−P(w))₃
#| context: uke06-projeksjon-context, uke06-opp2-context

La $w=(1,2,3)$. Finn $P(w)$ og $w-P(w)$.

$P(w)=$ vec[-1, 0, 1]

$w-P(w)=$ vec[2, 2, 2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**Generelt.** $P(w)\in V$ for alle $w$, og $P(v)=v$ for $v\in V$. Altså er
$\operatorname{Im}P=V$. Videre er $P(w)=0$ nøyaktig når
$\langle w,e_i\rangle=0$ for alle basisvektorene, altså når $w\perp V$:

$$
\operatorname{Ker}P=\{u\in W\mid\langle u,v\rangle=0\text{ for alle }v\in V\}=V^\perp .
$$

**a)** $\dim\operatorname{Im}P=\dim V=3$, og rangteoremet gir
$\dim\operatorname{Ker}P=\dim V^\perp=4-3=1$.

Hvis $P(w_1)=P(w_2)$, ligger både $w_1-P(w_1)$ og $w_2-P(w_2)$ i
$V^\perp$, som er endimensjonalt. De er derfor alltid **parallelle** (men ikke
nødvendigvis null eller ortogonale).

**b)** $V^\perp=\operatorname{span}\{n\}$ med $n=(1,1,1)$. Komponenten av $w$
langs $n$ er $\dfrac{w\cdot n}{n\cdot n}n=\dfrac63(1,1,1)=(2,2,2)$, så

$$
w-P(w)=(2,2,2),\qquad P(w)=(1,2,3)-(2,2,2)=(-1,0,1).
$$

Kontroll: $-1+0+1=0$, så $P(w)\in V$.

**Konklusjon fra flervalgsversjonen:** $\operatorname{Im}P=V$,
$\operatorname{Ker}P=V^\perp$ (både (i) og (ii)), og vektorene er alltid
parallelle.

:::

### Oppgave 3 – egenskaper ved projeksjonen

::: {#uke06-opp3-context .math-exercise-context}

La $W=\mathbb{R}^2$ med vanlig prikkprodukt, $V=\operatorname{span}\{(1,2)\}$
og $P$ projeksjonen på $V$. Standardmatrisen til $P$ er

$$
[P]=\frac15\begin{pmatrix}1&2\\2&4\end{pmatrix}.
$$

:::

```{math-exercise}
#| label: uke06-opp3-egenskaper
#| caption: P², avstand og dekomponering
#| mode: equivalent
#| field-labels: (P²)₁₁, (P²)₁₂, (P²)₂₁, (P²)₂₂, P(w)₁, P(w)₂, avstanden fra w til V
#| context: uke06-projeksjon-context, uke06-opp3-context

Regn ut $[P]^2$. La så $w=(3,1)$, finn $P(w)$ og den minste avstanden $\min_{v\in V}\|w-v\|$.

$[P]^2=$ mat[1/5, 2/5; 2/5, 4/5]

$P(w)=$ vec[1, 2]

$\min_{v\in V}\|w-v\|=$ __[sqrt(5)]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

$$
[P]^2=\frac1{25}\begin{pmatrix}1+4&2+8\\2+8&4+16\end{pmatrix}=\frac15\begin{pmatrix}1&2\\2&4\end{pmatrix}=[P].
$$

Dette gjelder alle projeksjoner: $P(w)\in V$ projiseres på seg selv, så
$P\circ P=P$ (ikke $0$ og ikke identiteten).

$P(w)=\frac15(3+2,\ 6+4)=(1,2)$ og $w-P(w)=(2,-1)$, som står vinkelrett på
$(1,2)$. Approksimasjonsteoremet sier at $P(w)$ er det nærmeste punktet i $V$,
så avstanden er $\|w-P(w)\|=\sqrt{4+1}=\sqrt5$. (Det er avstanden til $V$,
ikke til $V^\perp$.)

Dekomponeringen $w=P(w)+\big(w-P(w)\big)=(1,2)+(2,-1)$ skriver $w$ som et
element i $V$ pluss et element i $V^\perp$. Varianter som
$2P(w)+(w-2P(w))$ er riktige som summer, men $w-2P(w)$ ligger ikke i
$V^\perp$.

**Konklusjon fra flervalgsversjonen:** (ii), (iii) og (i).

:::

### Oppgave 4 – Fourierkoeffisienter

::: {#uke06-opp4-context .math-exercise-context}

La $V$ være rommet av kontinuerlige funksjoner $[-1,1]\to\mathbb{R}$ med
$\langle g,h\rangle=\int_{-1}^1g(x)h(x)\,dx$. Mengden
$S=\{\sin(n\pi x),\cos(n\pi x)\}_{n=1}^{10}$ er ortonormal, og $U=\operatorname{span}S$.
Vi ser på «hattefunksjonen»

$$
f(x)=\begin{cases}x+1,&-1\le x\le0,\\-x+1,&0\le x\le1.\end{cases}
$$

Det oppgis at $\langle f,\sin(n\pi x)\rangle=0$ og
$\langle f,\cos(n\pi x)\rangle=\dfrac{2}{\pi^2n^2}\big(1-\cos(n\pi)\big)$.

:::

```{math-exercise}
#| label: uke06-opp4-fourier
#| caption: Projeksjoner på sinus og cosinus
#| mode: equivalent
#| field-labels: ⟨f | sin πx⟩, ⟨f | cos πx⟩, ⟨f | cos 2πx⟩, ⟨f | cos 3πx⟩
#| context: uke06-projeksjon-context, uke06-opp4-context

Regn ut koeffisientene. Skriv $\pi$ som `pi`.

$\langle f,\sin(\pi x)\rangle=$ __[0]
$\langle f,\cos(\pi x)\rangle=$ __[4/pi**2]
$\langle f,\cos(2\pi x)\rangle=$ __[0]
$\langle f,\cos(3\pi x)\rangle=$ __[4/(9*pi**2)]
```

Kjør koden under for å se hvordan projeksjonene på stadig større
underrom nærmer seg $f$. Endre `N` og se hva som skjer.

```{pyodide-python}
import numpy as np
import matplotlib.pyplot as plt

N = 10  # bruk sin(nπx), cos(nπx) for n = 1, ..., N
x = np.linspace(-1, 1, 400)
f = 1 - np.abs(x)

proj = np.zeros_like(x)
for n in range(1, N + 1):
    a_n = 2 / (np.pi**2 * n**2) * (1 - np.cos(n * np.pi))
    proj += a_n * np.cos(n * np.pi * x)

plt.close("all")
plt.plot(x, f, label="f(x)")
plt.plot(x, proj, label=f"projeksjon på U (N = {N})")
plt.plot(x, f - proj, label="f - projeksjon")
plt.legend()
plt.grid(True)
plt.show()
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

$f$ er like og $\sin(n\pi x)$ er odde, så $\langle f,\sin(n\pi x)\rangle=0$
og projeksjonen på $\sin(\pi x)$ er $0$.

$1-\cos(n\pi)=1-(-1)^n$ er $2$ for odde $n$ og $0$ for like $n$. Altså er

$$
\langle f,\cos(n\pi x)\rangle=\begin{cases}\dfrac{4}{\pi^2n^2},&n\text{ odde},\\[1ex]0,&n\text{ like}.\end{cases}
$$

Projeksjonen på $\cos(\pi x)$ er $\dfrac{4}{\pi^2}\cos(\pi x)$, og projeksjonen
på $U$ er

$$
\operatorname{proj}_U f=\frac{4}{\pi^2}\Big(\cos\pi x+\frac{\cos3\pi x}{9}+\frac{\cos5\pi x}{25}+\frac{\cos7\pi x}{49}+\frac{\cos9\pi x}{81}\Big).
$$

Legg merke til at nevnerne er $n^2$, ikke $n$. Den konstante delen av $f$ er
ikke med, fordi $1\notin U$; derfor ligger kurven i Python-cellen
forskjøvet med $\tfrac12$ (gjennomsnittet av $f$).

**Konklusjon fra flervalgsversjonen:** $0$, $\dfrac{4}{\pi^2}\cos(\pi x)$ og
alternativ (ii).

:::

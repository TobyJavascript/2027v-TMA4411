Oppgavene bygger på flervalgsoppgavesett 9 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke09-rk-context .math-exercise-context}

**Begreper i denne uken.** En eksplisitt Runge–Kutta-metode med $s$ trinn for
$y'=f(t,y)$ er

$$
K_i=f\Big(t_n+c_ih,\ u_n+h\sum_{j<i}a_{ij}K_j\Big),\qquad
u_{n+1}=u_n+h\sum_{i=1}^sb_iK_i ,
$$

og skrives som Butcher-tablået

$$
\begin{array}{c|ccc}
c_1&&&\\ c_2&a_{21}&&\\ c_3&a_{31}&a_{32}&\\\hline &b_1&b_2&b_3
\end{array}
\qquad(c_1=0).
$$

Ordensbetingelser (med $c_i=\sum_ja_{ij}$): orden $\ge1$ krever
$\sum_ib_i=1$; orden $\ge2$ krever i tillegg $\sum_ib_ic_i=\tfrac12$; orden
$\ge3$ krever i tillegg $\sum_ib_ic_i^2=\tfrac13$ og
$\sum_{i,j}b_ia_{ij}c_j=\tfrac16$.

En metode av orden $p$ har global feil $O(h^p)$: når $h$ halveres, blir feilen
omtrent $2^p$ ganger mindre.

:::

### Oppgave 1 – Heuns metode som Butcher-tablå

::: {#uke09-opp1-context .math-exercise-context}

Metoden

$$
u_{n+1}=u_n+\frac h2(K_1+K_2),\qquad K_1=f(t_n,u_n),\quad K_2=f(t_n+h,\ u_n+hK_1)
$$

er et totrinns Runge–Kutta-skjema.

:::

```{math-exercise}
#| label: uke09-opp1-heun
#| caption: Tablå og orden for Heuns metode
#| mode: equivalent
#| field-labels: c_2, a_21, b_1, b_2, sum b_i c_i, orden
#| context: uke09-rk-context, uke09-opp1-context

$c_2=$ _[1]
$a_{21}=$ _[1]
$b_1=$ _[1/2]
$b_2=$ _[1/2]
$\sum_ib_ic_i=$ _[1/2]
Orden: _[2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

$K_2$ evalueres i $t_n+1\cdot h$ med $u_n+1\cdot hK_1$, så $c_2=a_{21}=1$, og
vektene er $b_1=b_2=\tfrac12$:

$$
\begin{array}{c|cc}0&&\\1&1&\\\hline&\tfrac12&\tfrac12\end{array}
$$

$\sum b_i=1$ og $\sum b_ic_i=\tfrac12\cdot0+\tfrac12\cdot1=\tfrac12$, mens
$\sum b_ic_i^2=\tfrac12\neq\tfrac13$. Metoden har altså orden $2$ (både den
globale avbruddsfeilen og den globale feilen er $O(h^2)$), som vi også fant med
Taylorutvikling i uke 8.

**Konklusjon fra flervalgsversjonen:** (i), orden $2$, orden $2$.

:::

### Oppgave 2 – fra kode til tablå

::: {#uke09-opp2-context .math-exercise-context}

Funksjonen `RKF` nedenfor implementerer en trestegs Runge–Kutta-metode for
$y'=f(t,y)$, der `odefile(t, y)` beregner $f(t,y)$. Cellen tester metoden på
$y'=t-y$, $y(0)=1$, med eksakt løsning $y(t)=t-1+2e^{-t}$.

:::

```{pyodide-python}
import numpy as np

def RKF(odefile, iv, h, N):
    solRKF = np.zeros((iv.size, N+1))
    solRKF[:, 0] = iv
    t0 = 0.0
    tt = np.zeros(N+1)
    for n in range(N):
        tn = t0 + n*h
        sol_o = solRKF[:, n]
        k1 = odefile(tn, sol_o)
        k2 = odefile(tn + 1/3*h, sol_o + 1/3*h*k1)
        k3 = odefile(tn + h, sol_o - h*k1 + 2*h*k2)
        sol_n = sol_o + 1/6*h*k1 + 2/3*h*k2 + 1/6*h*k3
        solRKF[:, n+1] = sol_n
        tt[n+1] = tn + h
    return solRKF, tt

f = lambda t, y: t - y
exact = lambda t: t - 1 + 2*np.exp(-t)

previous = None
for N in [10, 20, 40, 80]:
    sol, tt = RKF(f, np.array([1.0]), 1.0/N, N)
    err = abs(sol[0, -1] - exact(1.0))
    ratio = "" if previous is None else f"   forhold: {previous/err:.2f}"
    print(f"N = {N:3d}   feil i t = 1: {err:.3e}{ratio}")
    previous = err
```

```{math-exercise}
#| label: uke09-opp2-tablaa
#| caption: Les av Butcher-tablået
#| mode: equivalent
#| field-labels: c_2, c_3, a_21, a_31, a_32, b_1, b_2, b_3
#| context: uke09-rk-context, uke09-opp2-context

$c_2=$ _[1/3]
$c_3=$ _[1]
$a_{21}=$ _[1/3]
$a_{31}=$ _[-1]
$a_{32}=$ _[2]
$b_1=$ _[1/6]
$b_2=$ _[2/3]
$b_3=$ _[1/6]
```

```{math-exercise}
#| label: uke09-opp2-orden
#| caption: Hvilken orden har metoden?
#| mode: equivalent
#| field-labels: sum b_i c_i, orden, verdien av c_2 som gir orden 3
#| context: uke09-rk-context, uke09-opp2-context

Sjekk ordensbetingelsene, og sammenlign med forholdene som Python-cellen skriver ut. Prøv deretter å endre `1/3` til `1/2` begge steder i linjen for `k2`.

$\sum_ib_ic_i=$ _[7/18]
Orden: _[1]
Verdien $c_2=a_{21}$ som gir orden 3: _[1/2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

Fra linjene for `k2`, `k3` og `sol_n` leser vi

$$
\begin{array}{c|ccc}0&&&\\\tfrac13&\tfrac13&&\\1&-1&2&\\\hline&\tfrac16&\tfrac23&\tfrac16\end{array}
$$

(Radsummene stemmer: $c_2=\tfrac13$, $c_3=-1+2=1$.)

**Orden.** $\sum b_i=1$, men

$$
\sum_ib_ic_i=\tfrac16\cdot0+\tfrac23\cdot\tfrac13+\tfrac16\cdot1=\tfrac{7}{18}\neq\tfrac12,
$$

så metoden har bare **orden 1**. Python-cellen bekrefter det: feilen halveres
omtrent når $h$ halveres (forhold $\approx2$).

Med $c_2=a_{21}=\tfrac12$ får vi Kuttas klassiske tredjeordens metode:
$\sum b_ic_i=\tfrac13+\tfrac16=\tfrac12$,
$\sum b_ic_i^2=\tfrac16+\tfrac16=\tfrac13$ og
$\sum b_ia_{ij}c_j=\tfrac16\cdot2\cdot\tfrac12=\tfrac16$. Da viser cellen
forhold $\approx8=2^3$.

**Konklusjon fra flervalgsversjonen:** tablå (ii). (Spørsmålet om orden var
ikke med i 2026-versjonen.)

:::

### Oppgave 3 – fra tablå til formler

::: {#uke09-opp3-context .math-exercise-context}

Butcher-tablået

$$
\begin{array}{c|ccc}0&&&\\1&1&&\\\tfrac12&\tfrac14&\tfrac14&\\\hline&\tfrac23&\tfrac13&0\end{array}
$$

beskriver en Runge–Kutta-metode $u_{n+1}=u_n+h(\beta_1K_1+\beta_2K_2+\beta_3K_3)$
med $K_1=f(t_n,u_n)$, $K_2=f(t_n+\gamma_2h,\ u_n+\delta_{21}hK_1)$ og
$K_3=f\big(t_n+\gamma_3h,\ u_n+h(\delta_{31}K_1+\delta_{32}K_2)\big)$.

:::

```{math-exercise}
#| label: uke09-opp3-formler
#| caption: Skriv ut metoden
#| mode: equivalent
#| field-labels: β_1, β_2, β_3, γ_2, δ_21, γ_3, δ_31, δ_32
#| context: uke09-rk-context, uke09-opp3-context

$\beta_1=$ _[2/3]
$\beta_2=$ _[1/3]
$\beta_3=$ _[0]
$\gamma_2=$ _[1]
$\delta_{21}=$ _[1]
$\gamma_3=$ _[1/2]
$\delta_{31}=$ _[1/4]
$\delta_{32}=$ _[1/4]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

Første kolonne gir tidspunktene, den nedre trekanten gir koeffisientene i
argumentene, og nederste rad gir vektene:

$$
\begin{aligned}
K_1&=f(t_n,u_n),\qquad K_2=f(t_n+h,\ u_n+hK_1),\\
K_3&=f\big(t_n+\tfrac12h,\ u_n+\tfrac14h(K_1+K_2)\big),\\
u_{n+1}&=u_n+\tfrac h3(2K_1+K_2).
\end{aligned}
$$

$K_3$ beregnes, men har vekt $0$ og påvirker ikke $u_{n+1}$. Metoden er
konsistent ($\sum b_i=1$), men $\sum b_ic_i=\tfrac13\neq\tfrac12$, så den har
orden 1.

**Konklusjon fra flervalgsversjonen:** (ii).

:::

### Oppgave 4 – baklengs Euler for et system

::: {#uke09-opp4-context .math-exercise-context}

Vi ser på systemet

$$
y'(t)=Ay(t),\qquad A=\begin{pmatrix}1&2\\3&4\end{pmatrix},
$$

og baklengs (implisitt) Euler: $u_{n+1}=u_n+hAu_{n+1}$.

:::

```{math-exercise}
#| label: uke09-opp4-baklengs
#| caption: Ett steg med baklengs Euler
#| mode: equivalent
#| field-labels: M_11, M_12, M_21, M_22, u_1 første komponent, u_1 andre komponent
#| context: uke09-rk-context, uke09-opp4-context

Med $h=0.5$ og $y(1)=(3,-1)$: ett steg krever at vi løser $Mu_1=u_0$. Finn $M$ og tilnærmingen $u_1\approx y(1.5)$.

$M=$ mat[1/2, -1; -3/2, -1]

$u_1=$ vec[2, -2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

Komponentvis er baklengs Euler

$$
\begin{aligned}
u_{n+1,1}&=u_{n,1}+h\big(u_{n+1,1}+2u_{n+1,2}\big),\\
u_{n+1,2}&=u_{n,2}+h\big(3u_{n+1,1}+4u_{n+1,2}\big),
\end{aligned}
$$

der *alle* verdier på høyre side er tatt i det nye tidspunktet $n+1$. Det er et
lineært system $(I-hA)u_{n+1}=u_n$. Med $h=\tfrac12$:

$$
M=I-\tfrac12A=\begin{pmatrix}\tfrac12&-1\\-\tfrac32&-1\end{pmatrix},\qquad
\begin{pmatrix}\tfrac12&-1\\-\tfrac32&-1\end{pmatrix}\begin{pmatrix}u_1\\u_2\end{pmatrix}=\begin{pmatrix}3\\-1\end{pmatrix}.
$$

Trekk den andre ligningen fra den første: $2u_1=4$, så $u_1=2$ og
$u_2=\tfrac12\cdot2-3=-2$. Altså er $y(1.5)\approx(2,-2)$.

**Konklusjon fra flervalgsversjonen:** (iii) og (ii).

:::

### Oppgave 5 – leap-frog for en andreordens ligning

::: {#uke09-opp5-context .math-exercise-context}

Vi ser på $y''(t)=y'(t)-y(t)$, med $u_n\approx y(t_n)$ og $v_n\approx y'(t_n)$.
Leap-frog-metoden bruker sentrale differenser:

$$
\frac{u_{n+1}-2u_n+u_{n-1}}{h^2}=v_n-u_n,\qquad
\frac{u_{n+1}-u_{n-1}}{2h}=v_n .
$$

For å starte trenger vi en «spøkelsesverdi» $u_{-1}$. Skriv $u_0$, $v_0$ som
`u0`, `v0`.

:::

```{math-exercise}
#| label: uke09-opp5a-start
#| caption: Startverdiene
#| mode: equivalent
#| vars: u0, v0, h
#| field-labels: u_(−1), u_1
#| context: uke09-rk-context, uke09-opp5-context

Løs de to ligningene for $n=0$ med hensyn på $u_{-1}$ og $u_1$.

$u_{-1}=$ ___[((h**2 - 2*h)*v0 + (2 - h**2)*u0)/2]
$u_1=$ ___[((2*h + h**2)*v0 + (2 - h**2)*u0)/2]
```

```{math-exercise}
#| label: uke09-opp5b-tall
#| caption: Ett steg med h = 1
#| mode: equivalent
#| field-labels: u_1 ≈ y(2), v_1 ≈ y′(2)
#| context: uke09-rk-context, uke09-opp5-context

La $h=1$ og $(y(1),y'(1))=(1,\tfrac73)$, altså $u_0=1$, $v_0=\tfrac73$ i $t_0=1$. Finn $u_1\approx y(2)$, og bestem $v_1\approx y'(2)$ ved å bruke de to leap-frog-ligningene for $n=1$.

$u_1=$ _[4]
$v_1=$ _[2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 5"}

Skrevet som et system er $y_1=y$, $y_2=y'$ og $y_2'=y_2-y_1$, så høyresiden i
den første ligningen er $v_n-u_n$ (ikke $u_n-v_n$).

**a)** Den andre ligningen gir $u_1=u_{-1}+2hv_0$. Den første gir
$u_1+u_{-1}=2u_0+h^2(v_0-u_0)$. Legger vi sammen og trekker fra:

$$
u_1=\tfrac12\big((2h+h^2)v_0+(2-h^2)u_0\big),\qquad
u_{-1}=\tfrac12\big((h^2-2h)v_0+(2-h^2)u_0\big).
$$

**b)** Med $h=1$: $u_1=\tfrac12\big(3\cdot\tfrac73+1\big)=4$. For $n=1$ gir
ligningene $u_2=2u_1-u_0+(v_1-u_1)=3+v_1$ og $v_1=\tfrac{u_2-u_0}{2}=\tfrac{u_2-1}2$.
Innsatt: $v_1=\tfrac{2+v_1}{2}$, altså $v_1=2$ (og $u_2=5$). Dermed er
$(y(2),y'(2))\approx(4,2)$.

**Konklusjon fra flervalgsversjonen:** (ii), (ii) og (iii).

:::

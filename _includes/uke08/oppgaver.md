Oppgavene bygger på flervalgsoppgavesett 8 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv. Bruk gjerne Python-cellene til
å regne.

::: {#uke08-ode-context .math-exercise-context}

**Begreper i denne uken.** Vi løser $y'(t)=f(t,y(t))$, $y(t_0)=y_0$, med
skrittlengde $h$, tidspunkter $t_n=t_0+nh$ og tilnærminger $u_n\approx y(t_n)$.

- En ettstegsmetode skrives $u_{n+1}=g(u_n,u_{n+1})$; den er *eksplisitt* hvis
  $g$ ikke avhenger av $u_{n+1}$.
- Den *lokale avbruddsfeilen* er $\tau_n(h)=\dfrac{y_n-u_n^*}{h}$, der
  $y_n=y(t_n)$ er den eksakte løsningen og $u_n^*$ er det metoden gir etter
  ett steg *startet fra den eksakte verdien* $y_{n-1}$.
- Den *globale avbruddsfeilen* er $\tau(h)=\max_n|\tau_n(h)|$. Metoden har
  *orden* $p$ hvis $\tau(h)=O(h^p)$. For stabile metoder er den globale feilen
  $\max_n|y_n-u_n|$ da også $O(h^p)$.
- Taylor: $y(t+h)=y(t)+hy'(t)+\tfrac{h^2}{2}y''(t)+\tfrac{h^3}{6}y'''(t)+O(h^4)$,
  og for $y'=f(y)$ er $y''=f'(y)f(y)$.

:::

### Oppgave 1 – to steg med Heuns metode

::: {#uke08-opp1-context .math-exercise-context}

Vi ser på

$$
y'(t)=f(t,y)=(t\,y)^2-y,\qquad y(1)=1,
$$

og metoden (Heuns metode)

$$
u_{n+1}=u_n+\frac h2(k_1+k_2),\qquad k_1=f(t_n,u_n),\quad k_2=f(t_n+h,\ u_n+hk_1),
$$

med $h=0.1$, $t_0=1$ og $u_0=1$. Oppgi desimaltall med minst fire desimaler,
med punktum som desimalskilletegn.

:::

```{math-exercise}
#| label: uke08-opp1-heun
#| caption: Regn ut u₁ og u₂
#| mode: numeric
#| tolerance: 5e-5
#| field-labels: k_1 i første steg, k_2 i første steg, u_1, u_2
#| context: uke08-ode-context, uke08-opp1-context

Første steg: $k_1=$ _[0] , $k_2=$ _[0.21]
$u_1\approx$ _[1.0105]
$u_2\approx y(1.2)\approx$ _[1.046933]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

Ett Heun-steg er

$$
u_1=u_0+\frac h2\Big(f(t_0,u_0)+f\big(t_0+h,\ u_0+hf(t_0,u_0)\big)\Big).
$$

Legg merke til at $k_2$ evalueres i $t_0+h$, ikke i $t_0$.

**Steg 1** ($t_0=1$, $u_0=1$): $k_1=(1\cdot1)^2-1=0$. Da er
$u_0+hk_1=1$ og $k_2=f(1.1,1)=1.21-1=0.21$, så

$$
u_1=1+0.05\,(0+0.21)=1.0105 .
$$

**Steg 2** ($t_1=1.1$, $u_1=1.0105$):
$k_1=(1.1\cdot1.0105)^2-1.0105\approx0.225043$,
$u_1+hk_1\approx1.032999$ og
$k_2=f(1.2,\,1.032999)\approx0.503617$. Dermed er

$$
u_2=1.0105+0.05\,(0.225043+0.503617)\approx1.04693 .
$$

(Verdien $1.0105$ er $u_1\approx y(1.1)$, og $0.5036$ er $k_2$ i steg 2 –
ingen av dem er $y(1.2)$.)

**Konklusjon fra flervalgsversjonen:** (ii) og $y(1.2)\approx1.0469$.

:::

### Oppgave 2 – en implisitt metode

::: {#uke08-opp2-context .math-exercise-context}

La $f$ være glatt, og se på $y'=f(y)$ med metoden

$$
u_{n+1}=u_n+\frac h5f(u_n)+\frac{4h}5f(u_{n+1}).
$$

Den lokale avbruddsfeilen er da

$$
\tau_n(h)=\frac1h\Big(y_n-y_{n-1}-\frac h5f(y_{n-1})-\frac{4h}5f(y_n)\Big).
$$

:::

```{math-exercise}
#| label: uke08-opp2-orden
#| caption: Taylorutvikle avbruddsfeilen
#| mode: equivalent
#| field-labels: C, orden
#| context: uke08-ode-context, uke08-opp2-context

Bruk $f(y_{n-1})=y'(t_{n-1})$ og $f(y_n)=y'(t_n)$, og Taylorutvikle om $t_{n-1}$. Da er $\tau_n(h)=C\,h\,y''(t_{n-1})+O(h^2)$. Finn $C$ og ordenen til metoden.

$C=$ _[-3/10]
Orden: _[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

Startet fra den eksakte verdien $y_{n-1}$ gir metoden
$u_n^*=y_{n-1}+\tfrac h5f(y_{n-1})+\tfrac{4h}5f(y_n)$ – begge
$f$-verdiene evalueres i eksakte verdier, siden metoden er implisitt. Det gir
uttrykket for $\tau_n(h)$ over (ikke det for eksplisitt Euler).

Skriv $y=y(t_{n-1})$ osv. Da er

$$
y_n-y_{n-1}=hy'+\tfrac{h^2}{2}y''+O(h^3),\qquad f(y_n)=y'(t_n)=y'+hy''+O(h^2),
$$

og

$$
\tau_n(h)=\frac1h\Big(hy'+\tfrac{h^2}{2}y''-\tfrac h5y'-\tfrac{4h}{5}\big(y'+hy''\big)\Big)+O(h^2)
=\Big(\tfrac12-\tfrac45\Big)h\,y''+O(h^2)=-\tfrac{3}{10}\,h\,y''+O(h^2).
$$

Leddene med $y'$ forsvinner ($1-\tfrac15-\tfrac45=0$), så metoden er
konsistent, men $h$-leddet forsvinner ikke. Den globale avbruddsfeilen er
$O(h)$, og metoden har **orden 1**. (Bare vektene $\tfrac12,\tfrac12$ –
trapesmetoden – gir orden 2 i denne familien.)

**Konklusjon fra flervalgsversjonen:** (ii), orden $1$ og orden $1$.

:::

### Oppgave 3 – en eksplisitt Runge–Kutta-metode

::: {#uke08-opp3-context .math-exercise-context}

La $f$ være glatt, og se på $y'=f(y)$ med metoden

$$
u_{n+1}=u_n+\frac h4f(u_n)+\frac{3h}4f\Big(u_n+\frac{2h}3f(u_n)\Big)=g(u_n).
$$

:::

```{math-exercise}
#| label: uke08-opp3-orden
#| caption: Orden for en totrinns metode
#| mode: equivalent
#| field-labels: koeffisient foran h i τ_n, koeffisient foran h² i τ_n, orden
#| context: uke08-ode-context, uke08-opp3-context

Utvikle $\tau_n(h)=\frac1h\big(y_n-g(y_{n-1})\big)$ i potenser av $h$. Skriv $f$, $f'$ for verdiene i $y_{n-1}$, og bruk $y''=f'f$ og $y'''=f''f^2+(f')^2f$. Da er $\tau_n(h)=a\,h+b\,h^2\,(f')^2f+O(h^3)$ (leddene med $f''$ faller bort). Finn $a$, $b$ og ordenen.

$a=$ _[0]
$b=$ _[1/6]
Orden: _[2]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

Metoden er eksplisitt, så $u_n^*=g(y_{n-1})$ bruker bare $y_{n-1}$ (også inne
i den indre $f$). Taylorutvikling av den indre funksjonsverdien gir

$$
f\Big(y+\tfrac{2h}{3}f\Big)=f+\tfrac{2h}{3}f'f+\tfrac{2h^2}{9}f''f^2+O(h^3),
$$

så

$$
g(y)-y=\tfrac h4f+\tfrac{3h}4\Big(f+\tfrac{2h}{3}f'f+\tfrac{2h^2}{9}f''f^2\Big)+O(h^4)
=hf+\tfrac{h^2}{2}f'f+\tfrac{h^3}{6}f''f^2+O(h^4).
$$

Den eksakte løsningen gir
$y_n-y_{n-1}=hf+\tfrac{h^2}{2}f'f+\tfrac{h^3}{6}\big(f''f^2+(f')^2f\big)+O(h^4)$.
Differansen delt på $h$ er

$$
\tau_n(h)=\tfrac{1}{6}h^2(f')^2f+O(h^3).
$$

Altså er $a=0$, $b=\tfrac16$, og metoden har **orden 2**.

**Konklusjon fra flervalgsversjonen:** (i), orden $2$ og orden $2$.

:::

### Oppgave 4 – les koden

::: {#uke08-opp4-context .math-exercise-context}

Funksjonen `NM` nedenfor implementerer en ettstegsmetode for
$y'=f(t,y)$, $y(0)=y_0$, der `odefile(t, y)` beregner $f(t,y)$ og `iv` er
startverdien. Metoden kan skrives

$$
u_{n+1}=u_n+h\,(w_1k_1+w_2k_2),\quad k_1=f(t_n,u_n),\quad k_2=f(t_n+a\,h,\ u_n+b\,h\,k_1).
$$

:::

```{pyodide-python}
import numpy as np
import matplotlib.pyplot as plt

def NM(odefile, iv, h, N):
    solNM = np.zeros((iv.size, N+1))
    solNM[:, 0] = iv
    t0 = 0.0
    tt = np.zeros(N+1)
    for n in range(N):
        tn = t0 + n*h
        sol_o = solNM[:, n]
        k1 = odefile(tn, sol_o)
        k2 = odefile(tn + 2/3*h, sol_o + 2/3*h*k1)
        sol_n = sol_o + 1/4*h*k1 + 3/4*h*k2
        solNM[:, n+1] = sol_n
        tt[n+1] = tn + h
    return solNM, tt

# Test: y' = t - y, y(0) = 1, med eksakt løsning y(t) = t - 1 + 2 e^{-t}
f = lambda t, y: t - y
exact = lambda t: t - 1 + 2*np.exp(-t)

for N in [10, 20, 40, 80]:
    sol, tt = NM(f, np.array([1.0]), 1.0/N, N)
    print(f"N = {N:3d}   feil i t = 1: {abs(sol[0, -1] - exact(1.0)):.3e}")
```

```{math-exercise}
#| label: uke08-opp4-kode
#| caption: Hvilken metode er dette?
#| mode: equivalent
#| field-labels: a, b, w_1, w_2, forventet faktor når h halveres
#| context: uke08-ode-context, uke08-opp4-context

Les av koeffisientene i koden. Kjør så cellen: med hvilken faktor (omtrent) avtar feilen når $h$ halveres?

$a=$ _[2/3]
$b=$ _[2/3]
$w_1=$ _[1/4]
$w_2=$ _[3/4]
Faktor: _[4]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

Fra linjene `k2 = odefile(tn + 2/3*h, sol_o + 2/3*h*k1)` og
`sol_n = sol_o + 1/4*h*k1 + 3/4*h*k2` leser vi

$$
u_{n+1}=u_n+\frac h4f(t_n,u_n)+\frac{3h}4f\Big(t_n+\frac{2h}3,\ u_n+\frac{2h}3f(t_n,u_n)\Big),
$$

altså $a=b=\tfrac23$, $w_1=\tfrac14$, $w_2=\tfrac34$. Den andre
funksjonsevalueringen skjer i tidspunktet $t_n+\tfrac{2h}3$, ikke $t_n$.
For autonome ligninger er dette metoden fra oppgave 3, som har orden 2. Feilen
skal derfor avta med en faktor omtrent $2^2=4$ hver gang $h$ halveres, og det er
det Python-cellen viser.

**Konklusjon fra flervalgsversjonen:** (ii).

:::

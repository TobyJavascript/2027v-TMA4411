Oppgavene bygger på flervalgsoppgavesett 12 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke12-derivasjon-context .math-exercise-context}

**Begreper i denne uken.**

- Lineariseringen av en deriverbar $f\colon\mathbb{R}^n\to\mathbb{R}$ i
  punktet $a$ er $L(x)=f(a)+\nabla f(a)\cdot(x-a)$.
- Et *stasjonært punkt* er et punkt der $\nabla f=0$. Et indre
  ekstremalpunkt for en deriverbar funksjon er alltid stasjonært.
- Et stasjonært punkt er et *sadelpunkt* hvis $f$ har både større og mindre
  verdier enn $f(a)$ i hver omegn av $a$.
- For $f(x,y)$ med kontinuerlige andrederiverte: la
  $D=f_{xx}f_{yy}-f_{xy}^2$ i et stasjonært punkt. $D<0$ gir sadelpunkt;
  $D>0$ og $f_{xx}>0$ gir lokalt minimum; $D>0$ og $f_{xx}<0$ gir lokalt
  maksimum.
- På et lukket og begrenset område finner vi maksimum og minimum blant de
  stasjonære punktene i det indre og kandidatene på randen.

:::

### Oppgave 1 – linearisering

```{math-exercise}
#| label: uke12-opp1a-linearisering
#| caption: Linearisering av et polynom
#| mode: equivalent
#| vars: x, y, z
#| field-labels: f(a), f_x(a), f_y(a), f_z(a), L(x y z)
#| context: uke12-derivasjon-context

La $f(x,y,z)=x^3yz^2-2z$ og $a=(2,-1,5)$. Finn $f(a)$, gradienten og lineariseringen $L(x,y,z)$.

$f(a)=$ _[-210]
$\nabla f(a)=($ _[-300] , _[200] , _[-82] $)$
$L(x,y,z)=$ ___[1000 - 300*x + 200*y - 82*z]
```

```{math-exercise}
#| label: uke12-opp1b-linearisering
#| caption: Linearisering i et toppunkt
#| mode: equivalent
#| vars: x, y, z
#| field-labels: L(x y z)
#| context: uke12-derivasjon-context

La $f(x,y,z)=e^{-x^2-y^2-z^2}$. Finn lineariseringen i $(0,0,0)$.

$L(x,y,z)=$ __[1]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

**a)** $f_x=3x^2yz^2$, $f_y=x^3z^2$, $f_z=2x^3yz-2$. I $(2,-1,5)$:

$$
f(a)=8\cdot(-1)\cdot25-10=-210,\quad f_x=-300,\quad f_y=200,\quad f_z=-80-2=-82 .
$$

Dermed er

$$
L=-210-300(x-2)+200(y+1)-82(z-5)=1000-300x+200y-82z .
$$

Pass på fortegnene: $+200(y+1)$, ikke $-200(y+1)$, og $-300(x-2)$, ikke
$+300(x-2)$.

**b)** $\nabla f=-2(x,y,z)e^{-x^2-y^2-z^2}$, som er $0$ i origo, og
$f(0,0,0)=1$. Altså er $L=1$: tangentplanet er vannrett i toppunktet.

**Konklusjon fra flervalgsversjonen:** (i) og (i).

:::

### Oppgave 2 – stasjonære punkter

::: {#uke12-opp2-context .math-exercise-context}

Vi ser på

$$
f(x,y)=2x^2-2xy+2y+1\qquad\text{og}\qquad g(x,y)=e^{x^2+y^2-2x+2y}.
$$

Begge har nøyaktig ett stasjonært punkt.

:::

```{math-exercise}
#| label: uke12-opp2-stasjonar
#| caption: Finn og klassifiser
#| mode: equivalent
#| field-labels: x for f, y for f, D for f, x for g, y for g
#| context: uke12-derivasjon-context, uke12-opp2-context

Stasjonært punkt for $f$: $(x,y)=($ _[1] , _[2] $)$
$D=f_{xx}f_{yy}-f_{xy}^2$ i punktet: _[-4]
Stasjonært punkt for $g$: $(x,y)=($ _[1] , _[-1] $)$
```

```{math-exercise}
#| label: uke12-opp2-type
#| caption: Hva slags punkter er det?
#| mode: string_ci
#| field-labels: typen til punktet for f, typen til punktet for g
#| context: uke12-derivasjon-context, uke12-opp2-context

Skriv `sadel`, `min` eller `maks`.

Punktet for $f$: _[sadel]
Punktet for $g$: _[min]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**$f$:** $f_x=4x-2y=0$ og $f_y=-2x+2=0$ gir $x=1$ og $y=2$. Andrederiverte:
$f_{xx}=4$, $f_{yy}=0$, $f_{xy}=-2$, så $D=0-4=-4<0$: **sadelpunkt**.
(Direkte: $f(1,2)=3$. Langs $y=2$ er $f=2x^2-4x+5$, som har minimum $3$ i
$x=1$, mens langs linjen $(1+t,\,2+2t)$ er $f=3-2t^2$, som har maksimum $3$ i
$t=0$.)

**$g$:** Eksponentialfunksjonen er strengt voksende, så $g$ har stasjonære
punkter der eksponenten $q(x,y)=x^2+y^2-2x+2y=(x-1)^2+(y+1)^2-2$ har det:
$\nabla g=e^{q}\nabla q=0\iff(2x-2,2y+2)=0\iff(x,y)=(1,-1)$. Der har $q$
globalt minimum $-2$, så $g$ har globalt **minimum** $e^{-2}$ – ikke et
sadelpunkt.

**Konklusjon fra flervalgsversjonen:** $(1,2)$; $(1,-1)$; punktet i (a) er et
sadelpunkt, mens punktet i (b) ikke er det.

:::

### Oppgave 3 – maksimum på et kvadrat

::: {#uke12-opp3-context .math-exercise-context}

La

$$
A(x,y)=28x+28y-2x^2-2y^2-3xy
$$

på kvadratet $Q=\{(x,y)\mid 0\le x\le14,\ 0\le y\le14\}$.

:::

```{math-exercise}
#| label: uke12-opp3-maks
#| caption: Indre punkt og rand
#| mode: equivalent
#| field-labels: x-koordinat til stasjonært punkt, y-koordinat til stasjonært punkt, A i det stasjonære punktet, største verdi på randen, maks på Q
#| context: uke12-derivasjon-context, uke12-opp3-context

Stasjonært punkt: $(x,y)=($ _[4] , _[4] $)$
$A$ i det stasjonære punktet: _[112]
Største verdi av $A$ på randen av $Q$: _[98]
$\max_QA=$ _[112]
```

Utforsk gjerne funksjonen i Python:

```{pyodide-python}
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 14, 200)
X, Y = np.meshgrid(x, x)
A = 28*X + 28*Y - 2*X**2 - 2*Y**2 - 3*X*Y

plt.close("all")
cs = plt.contour(X, Y, A, levels=[-400, -200, 0, 50, 98, 112 - 1e-9])
plt.clabel(cs)
plt.plot(4, 4, "r*", markersize=12, label="stasjonært punkt (4, 4)")
plt.gca().set_aspect("equal")
plt.legend()
plt.title("Nivåkurver for A(x, y)")
plt.show()
print("Største verdi på et 200×200-gitter:", A.max())
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

**Indre punkter:** $A_x=28-4x-3y=0$ og $A_y=28-4y-3x=0$. Trekker vi
ligningene fra hverandre, får vi $x=y$, og da $28-7x=0$, altså $(4,4)$, med
$A(4,4)=112+112-32-32-48=112$. Hessematrisen
$\begin{pmatrix}-4&-3\\-3&-4\end{pmatrix}$ har $D=16-9=7>0$ og
$A_{xx}<0$: lokalt maksimum.

**Randen:**

- $y=0$: $A=28x-2x^2$, maksimum $98$ i $x=7$ (tilsvarende for $x=0$).
- $y=14$: $A=-2x^2-14x$, som er $\le0$ på $[0,14]$ (tilsvarende for $x=14$).

Største verdi på randen er altså $98<112$, så

$$
\max_QA=A(4,4)=112 .
$$

($98$ er randmaksimum, og $196=28\cdot7$ er ikke en verdi $A$ antar.)

**Konklusjon fra flervalgsversjonen:** (ii).

:::

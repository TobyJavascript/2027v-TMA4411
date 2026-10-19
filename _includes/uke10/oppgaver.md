Oppgavene bygger på flervalgsoppgavesett 10 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke10-mengder-context .math-exercise-context}

**Begreper i denne uken.**

- Nivåkurven $f(x,y)=c$ er mengden av punkter i planet der $f$ har verdien $c$.
- En mengde $A\subseteq\mathbb{R}^n$ er *åpen* hvis hvert punkt i $A$ har en
  åpen kule rundt seg som ligger helt i $A$. Den er *lukket* hvis komplementet
  er åpent; ekvivalent: grensen til enhver konvergent følge i $A$ ligger i $A$.
- Et *randpunkt* til $A$ er et punkt der hver kule rundt punktet inneholder
  både punkter i $A$ og punkter utenfor $A$. $A$ er åpen hvis og bare hvis den
  ikke inneholder noen av randpunktene sine, og lukket hvis og bare hvis den
  inneholder alle.
- $A$ er *kompakt* hvis den er lukket og begrenset. (Bolzano–Weierstrass:
  da har hver følge i $A$ en delfølge som konvergerer mot et punkt i $A$.)
- En følge i $\mathbb{R}^n$ konvergerer hvis og bare hvis hver komponent
  konvergerer.

:::

### Oppgave 1 – nivåkurver

::: {#uke10-opp1-context .math-exercise-context}

La

$$
f(x,y)=e^{-x^2-y^2}\qquad\text{og}\qquad g(x,y)=2x-4y .
$$

:::

```{math-exercise}
#| label: uke10-opp1-niva
#| caption: Finn nivåkurvene
#| mode: equivalent
#| vars: c
#| field-labels: r² for f = 0.2, stigningstall for nivåkurvene til g, konstantledd for g = c
#| context: uke10-mengder-context, uke10-opp1-context

Nivåkurven $f(x,y)=0.2$ er sirkelen $x^2+y^2=r^2$. Nivåkurven $g(x,y)=c$ er linjen $y=ax+b$. Skriv $\ln$ som `ln`.

$r^2=$ __[ln(5)]
$a=$ _[1/2]
$b=$ __[-c/4]
```

Prøv gjerne å se nivåkurvene i Python:

```{pyodide-python}
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-2, 2, 200)
X, Y = np.meshgrid(x, x)
F = np.exp(-X**2 - Y**2)
G = 2*X - 4*Y

plt.close("all")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5))
cs1 = ax1.contour(X, Y, F, levels=[0.2, 0.4, 0.6, 0.8])
ax1.clabel(cs1)
ax1.set_title("f(x,y) = exp(-x² - y²)")
cs2 = ax2.contour(X, Y, G, levels=[-4, -2, 0, 2, 4])
ax2.clabel(cs2)
ax2.set_title("g(x,y) = 2x - 4y")
for ax in (ax1, ax2):
    ax.set_aspect("equal")
    ax.grid(True)
plt.show()
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

$e^{-x^2-y^2}=0.2$ gir $-(x^2+y^2)=\ln0.2=-\ln5$, altså

$$
x^2+y^2=\ln5\approx1.609 .
$$

($\ln0.2$ er negativ, så $x^2+y^2=\ln(0.2)$ har ingen løsninger.)

$2x-4y=c$ gir $y=\tfrac12x-\tfrac c4$. Alle nivåkurvene til $g$ er parallelle
linjer med stigningstall $\tfrac12$; nivåkurven $g=0$ er $y=\tfrac12x$.

**Konklusjon fra flervalgsversjonen:** (ii) og (ii).

:::

### Oppgave 2 – åpne, lukkede og kompakte mengder

::: {#uke10-opp2-context .math-exercise-context}

Vi ser på mengdene

$$
\begin{aligned}
A_1&=\{(x,y)\mid x^2+y^2=1\},\qquad
A_2=\{(x,y)\mid x\ge0,\ y>0\},\\
A_3&=\{(x,y)\mid x<0,\ y>0\},\qquad
A_4=\{(x,y)\mid x\ge0,\ y\ge0\}.
\end{aligned}
$$

:::

#### a) $A_2$ er ikke åpen

```{math-exercise}
#| label: uke10-opp2a-ikke-apen
#| caption: Et randpunkt som ligger i mengden
#| mode: custom
#| field-labels: x, y
#| context: uke10-mengder-context, uke10-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       x, y = [nsimplify(v) for v in response["expressions"][:2]]
#|       if not (x.is_real and y.is_real):
#|           return {"correct": False}
#|       if not (x >= 0 and y > 0):
#|           return {"correct": False, "feedback": "Punktet ligger ikke i A_2."}
#|       if x != 0:
#|           return {"correct": False, "feedback": "Rundt dette punktet fins det en liten disk som ligger helt i A_2."}
#|       return {"correct": True}
#| tests: |
#|   def test(check, symbols):
#|       assert check({"expressions": [Integer(0), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(1), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(0), Integer(0)]}, symbols)["correct"]

Finn et punkt $(x,y)\in A_2$ slik at *hver* disk rundt punktet inneholder punkter utenfor $A_2$.

$x=$ _[]
$y=$ _[]
```

#### b) $A_2$ og $A_3$ er ikke lukkede

```{math-exercise}
#| label: uke10-opp2b-ikke-lukket
#| caption: En grense som faller utenfor
#| mode: custom
#| vars: n
#| field-labels: x_n, y_n
#| context: uke10-mengder-context, uke10-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       n = symbols["n"]
#|       xn, yn = response["expressions"][:2]
#|       try:
#|           inside = all(bool(xn.subs(n, k) < 0) and bool(yn.subs(n, k) > 0) for k in range(1, 30))
#|           lx, ly = limit(xn, n, oo), limit(yn, n, oo)
#|       except Exception:
#|           return {"correct": False, "feedback": "Klarte ikke å regne med følgen. Bruk et enkelt uttrykk i n."}
#|       if not inside:
#|           return {"correct": False, "feedback": "Følgen må ligge i A_3 for alle n ≥ 1, altså x_n < 0 og y_n > 0."}
#|       if not (lx.is_finite and ly.is_finite):
#|           return {"correct": False, "feedback": "Følgen må konvergere."}
#|       outside = not (lx < 0 and ly > 0)
#|       if outside:
#|           return {"correct": True}
#|       return {"correct": False, "feedback": "Grensen ligger fortsatt i A_3."}
#| tests: |
#|   def test(check, symbols):
#|       n = symbols["n"]
#|       assert check({"expressions": [-1/n, Integer(1)]}, symbols)["correct"]
#|       assert check({"expressions": [Integer(-1), 1/n**2]}, symbols)["correct"]
#|       assert not check({"expressions": [Integer(-1), Integer(1)]}, symbols)["correct"]
#|       assert not check({"expressions": [1/n, Integer(1)]}, symbols)["correct"]

Finn en følge $(x_n,y_n)$ som ligger i $A_3$ for alle $n\ge1$, men som konvergerer mot et punkt *utenfor* $A_3$. Skriv uttrykk i `n`.

$x_n=$ __[]
$y_n=$ __[]
```

#### c) $A_4$ er ikke kompakt

```{math-exercise}
#| label: uke10-opp2c-ikke-kompakt
#| caption: En følge uten konvergent delfølge
#| mode: custom
#| vars: n
#| field-labels: x_n, y_n
#| context: uke10-mengder-context, uke10-opp2-context
#| checker: |
#|   def check(response, symbols):
#|       n = symbols["n"]
#|       xn, yn = response["expressions"][:2]
#|       try:
#|           inside = all(bool(xn.subs(n, k) >= 0) and bool(yn.subs(n, k) >= 0) for k in range(1, 30))
#|           growth = limit(sqrt(xn**2 + yn**2), n, oo)
#|       except Exception:
#|           return {"correct": False, "feedback": "Klarte ikke å regne med følgen. Bruk et enkelt uttrykk i n."}
#|       if not inside:
#|           return {"correct": False, "feedback": "Følgen må ligge i A_4 for alle n ≥ 1."}
#|       if growth == oo:
#|           return {"correct": True}
#|       return {"correct": False, "feedback": "Denne følgen er begrenset, og har derfor en konvergent delfølge."}
#| tests: |
#|   def test(check, symbols):
#|       n = symbols["n"]
#|       assert check({"expressions": [n, Integer(0)]}, symbols)["correct"]
#|       assert check({"expressions": [n**2, n]}, symbols)["correct"]
#|       assert not check({"expressions": [1/n, Integer(0)]}, symbols)["correct"]
#|       assert not check({"expressions": [-n, Integer(0)]}, symbols)["correct"]

$A_4$ er lukket. Vis at den likevel ikke er kompakt ved å finne en følge $(x_n,y_n)$ i $A_4$ med $|(x_n,y_n)|\to\infty$; en slik følge har ingen konvergent delfølge.

$x_n=$ __[]
$y_n=$ __[]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

**$A_1$ (enhetssirkelen)** er ikke åpen: hver disk rundt et punkt på sirkelen
inneholder punkter som ikke ligger på sirkelen. Den er lukket (komplementet er
åpent, eller: hvis $x_n^2+y_n^2=1$ og $(x_n,y_n)\to(x,y)$, så er
$x^2+y^2=1$), og begrenset, altså **kompakt**.

**$A_2$** er verken åpen eller lukket.

- **a)** $(0,1)\in A_2$ er et randpunkt: hver disk rundt det inneholder punkter
  med $x<0$. Alle punkter $(0,y)$ med $y>0$ virker.
- Punktet $(1,0)$ er et randpunkt som *ikke* ligger i $A_2$ (grensen til
  $(1,\tfrac1n)$), så $A_2$ er heller ikke lukket.

**$A_3$** er åpen: rundt $(x,y)$ med $x<0$, $y>0$ ligger disken med radius
$\min(|x|,y)$ helt i $A_3$.

- **b)** Den er ikke lukket: for eksempel ligger $(-\tfrac1n,1)$ i $A_3$, men
  grensen $(0,1)$ gjør det ikke.

**$A_4$** er lukket (begge ulikhetene er ikke-strenge), men ubegrenset, så
**ikke kompakt**.

- **c)** $(n,0)\in A_4$ har $|(n,0)|=n\to\infty$. Ingen delfølge kan
  konvergere, fordi en konvergent følge er begrenset.

**Konklusjon fra flervalgsversjonen:** åpen: (iii); lukket: (i); kompakt: (i).

:::

### Oppgave 3 – følger og delfølger

::: {#uke10-opp3-context .math-exercise-context}

Vi ser på følgene

$$
a_n=\Big(\frac{n^2}{1+n^2},\ \frac1n\Big)\qquad\text{og}\qquad
b_n=\Big((-1)^n,\ \frac{1}{n^2}\Big).
$$

$b_n$ konvergerer ikke. Vi ser derfor på delfølgene med like og odde indekser.

:::

```{math-exercise}
#| label: uke10-opp3-folger
#| caption: Grenseverdier
#| mode: equivalent
#| field-labels: lim a_n første komponent, lim a_n andre komponent, lim b_2k første komponent, lim b_2k andre komponent, lim b_(2k+1) første komponent, lim b_(2k+1) andre komponent
#| context: uke10-mengder-context, uke10-opp3-context

$\displaystyle\lim_{n\to\infty}a_n=$ vec[1, 0]

$\displaystyle\lim_{k\to\infty}b_{2k}=$ vec[1, 0]

$\displaystyle\lim_{k\to\infty}b_{2k+1}=$ vec[-1, 0]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

En følge i $\mathbb{R}^2$ konvergerer når begge komponentene konvergerer:
$\frac{n^2}{1+n^2}=\frac{1}{1/n^2+1}\to1$ og $\frac1n\to0$, så
$a_n\to(1,0)$. (Grensen er et punkt i $\mathbb{R}^2$, ikke tallet $1$.)

For $b_n$ er første komponent $1,-1,1,-1,\dots$, som ikke konvergerer, så
$\lim b_n$ **eksisterer ikke**. Men delfølgene konvergerer:
$b_{2k}=(1,\tfrac1{4k^2})\to(1,0)$ og $b_{2k+1}\to(-1,0)$.

Dette er Bolzano–Weierstrass i praksis: $|b_n|\le\sqrt2$, så følgen er
begrenset, og har derfor en konvergent delfølge – selv om følgen selv ikke
konvergerer.

**Konklusjon fra flervalgsversjonen:** $(1,0)$; eksisterer ikke; ja, siden
følgen er begrenset.

:::

### Oppgave 4 – avstand mellom to følger

::: {#uke10-opp4-context .math-exercise-context}

La $x_n=\big(1+\tfrac1n,\ 1+\tfrac1n\big)$ og
$y_n=\big(1-\tfrac1n,\ 1-\tfrac1n\big)$.

:::

```{math-exercise}
#| label: uke10-opp4-avstand
#| caption: Grenser og avstand
#| mode: equivalent
#| vars: n
#| field-labels: lim x_n første komponent, lim x_n andre komponent, lim y_n første komponent, lim y_n andre komponent, |x_n − y_n|², grensen av |x_n − y_n|²
#| context: uke10-mengder-context, uke10-opp4-context

$\displaystyle\lim_{n\to\infty}x_n=$ vec[1, 1]

$\displaystyle\lim_{n\to\infty}y_n=$ vec[1, 1]

$|x_n-y_n|^2=$ __[8/n**2]
$\displaystyle\lim_{n\to\infty}|x_n-y_n|^2=$ _[0]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

Begge følgene konvergerer komponentvis mot $(1,1)$ – den ene ovenfra, den andre
nedenfra. Differansen er $x_n-y_n=(\tfrac2n,\tfrac2n)$, så

$$
|x_n-y_n|^2=\frac4{n^2}+\frac4{n^2}=\frac8{n^2}\to0 .
$$

Svaret er et *tall*, ikke en vektor: normen av en vektor er et tall.

**Konklusjon fra flervalgsversjonen:** $(1,1)$, $(1,1)$ og $0$.

:::

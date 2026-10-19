Oppgavene bygger på flervalgsoppgavesett 13 fra 2026, omformulert slik at du
må regne deg fram til svaret i stedet for å velge blant alternativer. Svar,
trykk **Sjekk**, og bruk eventuelt **Tilbakemelding** for et hint. Åpne
løsningsforslaget først når du har prøvd selv.

::: {#uke13-hesse-context .math-exercise-context}

**Begreper i denne uken.**

- $f_{xy}=\dfrac{\partial}{\partial y}\Big(\dfrac{\partial f}{\partial x}\Big)$
  og $f_{yx}=\dfrac{\partial}{\partial x}\Big(\dfrac{\partial f}{\partial y}\Big)$.
  Hvis begge er kontinuerlige, er $f_{xy}=f_{yx}$.
- Hessematrisen er $H=\begin{pmatrix}f_{xx}&f_{xy}\\f_{yx}&f_{yy}\end{pmatrix}$.
- *Andrederiverttesten* i et stasjonært punkt, med $D=\det H=f_{xx}f_{yy}-f_{xy}^2$:
  $D>0$, $f_{xx}>0$ gir lokalt minimum; $D>0$, $f_{xx}<0$ gir lokalt
  maksimum; $D<0$ gir sadelpunkt; $D=0$ gir ingen konklusjon.
- I svarfelt skriver du $e^{u}$ som `exp(u)` og $\ln$ som `ln` eller `log`.

:::

### Oppgave 1 – blandede andrederiverte

```{math-exercise}
#| label: uke13-opp1-blandede
#| caption: Deriver i begge rekkefølger
#| mode: equivalent
#| vars: x, y
#| field-labels: f_x, f_xy, f_y, f_yx
#| context: uke13-hesse-context

La $f(x,y)=x^2y^3+e^{xy}$. Regn ut

$f_x=$ ___[2*x*y**3 + y*exp(x*y)]
$f_{xy}=$ ___[6*x*y**2 + (1 + x*y)*exp(x*y)]
$f_y=$ ___[3*x**2*y**2 + x*exp(x*y)]
$f_{yx}=$ ___[6*x*y**2 + (1 + x*y)*exp(x*y)]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 1"}

$$
f_x=2xy^3+ye^{xy},\qquad
f_{xy}=\frac{\partial}{\partial y}\big(2xy^3+ye^{xy}\big)=6xy^2+e^{xy}+xye^{xy}=6xy^2+(1+xy)e^{xy}.
$$

$$
f_y=3x^2y^2+xe^{xy},\qquad
f_{yx}=\frac{\partial}{\partial x}\big(3x^2y^2+xe^{xy}\big)=6xy^2+(1+xy)e^{xy}.
$$

De er like, slik teoremet om blandede andrederiverte sier, fordi alle
andrederiverte er kontinuerlige. En vanlig feil er å glemme produktregelen på
$ye^{xy}$ (eller $xe^{xy}$), som gir $ye^{xy}$ eller $xe^{xy}$ i stedet for
$(1+xy)e^{xy}$.

**Konklusjon fra flervalgsversjonen:** (i).

:::

### Oppgave 2 – en hel linje av minimumspunkter

::: {#uke13-opp2-context .math-exercise-context}

La $f(x,y)=e^{x^2-2xy+y^2}$.

:::

```{math-exercise}
#| label: uke13-opp2-linje
#| caption: Hvor er f minst?
#| mode: equivalent
#| vars: x, y
#| field-labels: eksponenten som et kvadrat, minste verdi av f, D i et minimumspunkt
#| context: uke13-hesse-context, uke13-opp2-context

Skriv eksponenten som et fullstendig kvadrat, finn den minste verdien av $f$, og regn ut $D=f_{xx}f_{yy}-f_{xy}^2$ i et av minimumspunktene.

$x^2-2xy+y^2=$ __[(x-y)**2]
$\min f=$ _[1]
$D=$ _[0]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 2"}

$x^2-2xy+y^2=(x-y)^2\ge0$, med likhet nøyaktig når $x=y$. Siden $e^u$ er
strengt voksende, er $f\ge e^0=1$, med likhet på hele linjen
$\{(x,y)\mid x=y\}$. Alle disse punktene er (globale, og dermed lokale)
minimumspunkter – ikke bare origo.

Andrederiverttesten gir ingen konklusjon her: på linjen er
$f_{xx}=f_{yy}=2$ og $f_{xy}=-2$, så $D=4-4=0$. Det er typisk når
minimumspunktene ikke er isolerte.

**Konklusjon fra flervalgsversjonen:** (i).

:::

### Oppgave 3 – andrederiverttesten

::: {#uke13-opp3-context .math-exercise-context}

La $A(x,y)=28x+28y-2x^2-2y^2-3xy$ (fra uke 12). Det stasjonære punktet er
$(4,4)$.

:::

```{math-exercise}
#| label: uke13-opp3-test
#| caption: Klassifiser (4, 4)
#| mode: equivalent
#| field-labels: A_xx, A_xy, A_yx, A_yy, D
#| context: uke13-hesse-context, uke13-opp3-context

$H=$ mat[-4, -3; -3, -4]

$D=$ _[7]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 3"}

$A_{xx}=-4$, $A_{yy}=-4$, $A_{xy}=-3$, så $D=16-9=7>0$ og $A_{xx}<0$:
$(4,4)$ er et **lokalt maksimum**. (Siden $H$ er konstant og negativt
definitt, er $A$ konkav, og maksimum er faktisk globalt.)

**Konklusjon fra flervalgsversjonen:** (ii).

:::

### Oppgave 4 – to stasjonære punkter

::: {#uke13-opp4-context .math-exercise-context}

La

$$
f(x,y)=x+y-\frac32\ln\big(1+x^2+y^2\big).
$$

:::

```{math-exercise}
#| label: uke13-opp4-punkter
#| caption: Finn og klassifiser de stasjonære punktene
#| mode: equivalent
#| field-labels: D i (1/2 1/2), D i (1 1)
#| context: uke13-hesse-context, uke13-opp4-context

Vis at $(\tfrac12,\tfrac12)$ og $(1,1)$ er de eneste stasjonære punktene, og regn ut $D=f_{xx}f_{yy}-f_{xy}^2$ i hvert av dem.

$D$ i $(\tfrac12,\tfrac12)$: _[4/3]
$D$ i $(1,1)$: _[-1/3]
```

```{math-exercise}
#| label: uke13-opp4-type
#| caption: Hvilken type?
#| mode: string_ci
#| field-labels: typen til (1/2 1/2), typen til (1 1)
#| context: uke13-hesse-context, uke13-opp4-context

Skriv `sadel`, `min` eller `maks`.

$(\tfrac12,\tfrac12)$: _[maks]
$(1,1)$: _[sadel]
```

::: {.callout-tip collapse="true" title="Løsningsforslag til oppgave 4"}

Med $r^2=x^2+y^2$:

$$
f_x=1-\frac{3x}{1+r^2},\qquad f_y=1-\frac{3y}{1+r^2}.
$$

$f_x=f_y=0$ gir $3x=3y=1+r^2$, altså $x=y$ og $3x=1+2x^2$, dvs.
$2x^2-3x+1=(2x-1)(x-1)=0$. De stasjonære punktene er
$(\tfrac12,\tfrac12)$ og $(1,1)$.

De andrederiverte er

$$
f_{xx}=-\frac{3(1+r^2)-6x^2}{(1+r^2)^2},\quad
f_{yy}=-\frac{3(1+r^2)-6y^2}{(1+r^2)^2},\quad
f_{xy}=\frac{6xy}{(1+r^2)^2}.
$$

- I $(\tfrac12,\tfrac12)$ er $1+r^2=\tfrac32$:
  $f_{xx}=f_{yy}=-\tfrac43$, $f_{xy}=\tfrac23$, så
  $D=\tfrac{16}9-\tfrac49=\tfrac43>0$ og $f_{xx}<0$: **lokalt maksimum**.
- I $(1,1)$ er $1+r^2=3$: $f_{xx}=f_{yy}=-\tfrac13$, $f_{xy}=\tfrac23$, så
  $D=\tfrac19-\tfrac49=-\tfrac13<0$: **sadelpunkt**.

**Konklusjon fra flervalgsversjonen:** (ii).

:::

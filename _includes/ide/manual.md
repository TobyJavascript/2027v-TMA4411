::: {.panel-tabset}

## IDE

### Python direkte i nettleseren

Mini-IDE-en kjører Python lokalt i nettleseren ved hjelp av [Pyodide](https://pyodide.org/). Du trenger derfor ikke installere Python for å prøve eksemplene. Første oppstart kan ta litt tid mens Python og nødvendige pakker lastes inn.

### Kom raskt i gang

1. Skriv eller endre kode i et kodevindu.
2. Velg **Kjør koden** for å kjøre vinduet.
3. Les utskrift, feilmeldinger og figurer under kodevinduet.
4. Velg **+ Kodeblokk** når du vil ha et tomt arbeidsvindu.
5. Last inn siden på nytt hvis du vil nullstille Python-miljøet på siden. (Knappen **↻ Tilbakestill** setter koden i vinduet tilbake til den opprinnelige, den nullstiller ikke Python.)

Prøv gjerne dette eksemplet:

```{pyodide-python}
import numpy as np
import matplotlib.pyplot as plt

plt.close("all")

x = np.linspace(0, 2*np.pi, 200)
y = np.sin(x)

fig = plt.figure()
ax = fig.add_subplot(111)
ax.plot(x, y)
ax.set_xlabel("x")
ax.set_ylabel("sin(x)")
ax.set_title("En enkel sinuskurve")
ax.grid(True)

plt.show()
```

### Slik fungerer arbeidsmiljøet

Alle kodevinduer på **samme side** deler variabler, funksjoner og importer. Kjør derfor celler i naturlig rekkefølge når en celle bygger på en tidligere celle. (En **side** i konteksten av denne ressursen er en HTML-side. Hver pensumuke ligger på egen side med alle sine faner og underfaner.)

Python-miljøet deles ikke mellom ulike sider, og det opprettes på nytt når du laster inn siden på nytt eller stopper en kjøring med **Stopp**. Hver Python-celle på disse sidene importerer selv bibliotekene den trenger. Hvis du senere kjører en synlig, endret versjon av en funksjon, brukes den endrede versjonen resten av økten.

::: {.callout-warning title="Ta vare på arbeidet ditt"}

Koden lagres ikke automatisk. Kopier kode du vil beholde til en lokal fil, VS Code eller et annet egnet sted før du lukker eller laster inn siden på nytt.
:::

### Når noe ikke virker

- Les den siste linjen i feilmeldingen først; den beskriver ofte hovedproblemet.
- Kontroller at cellene som definerer variabler og funksjoner, er kjørt.
- Kjør cellen på nytt etter at du har rettet koden.
- Få evt. KI-hjelp ved å trykke på **Tilbakemelding**-knappen.
- Last inn siden på nytt og kjør nødvendige celler på nytt hvis miljøet har fått en uklar tilstand.
- Last inn hele nettsiden på nytt hvis knappene eller Python-miljøet har stoppet.

## README

### KI-feedback

#### Hvordan få KI-tilbakemeldingen?

Kode- og matematikkoppgaver kan ha en **Tilbakemelding**-knapp. Når du trykker på denne knappen, så sendes ditt input til en LLM som først skal trekke fram det som allerede er riktig, før den peker mot det neste du bør undersøke. 

I matematikkoppgavene blir hjelpen gradvis tydeligere:

1. **Lite hint:** et spørsmål eller et tips som hjelper deg å finne neste steg.
2. **Større hint:** forklaring av det relevante begrepet eller sammenhengen.
3. **Framgangsmåte:** en strukturert metode, men uten at oppgaven regnes helt ut for deg.
4. **Gjennomarbeidet løsning:** en full utregning når flere forsøk ikke har ført fram.

Forsøksnummeret gjelder tilbakemeldingen for den aktuelle oppgaven. Tilbakemeldingen erstatter ikke egen kontroll: språkmodeller kan misforstå oppgavetekst, notasjon eller tall. Sammenlign derfor rådene med definisjonene og eksemplene på siden, særlig hvis noe virker selvmotsigende.

#### Koble til NTNUs modell-tjeneste

Tilbakemeldingen bruker språkmodeller på NTNUs HPC-infrastruktur (IDUN) og krever en personlig API-nøkkel. Se [LLM API service and gpt.ntnu.no – IDUN documentation](https://www.hpc.ntnu.no/idun/documentation/ai-coding-assistant-and-large-language-models-llms-on-idun/) for tilgang og oppdaterte tjenesteinnstillinger.

Når du har fått nøkkelen:

1. Trykk på **tannhjulikonet** (⚙) ved knappen **Tilbakemelding**. Da åpnes **Innstillinger for KI**.
2. Velg **Direkte API** under **Modus**. Med standardvalget **Kopier instruksjon** sendes ingenting; du får i stedet en instruksjon som du selv kan lime inn i en KI-chat.
3. Fyll inn **API-adresse** (base-URL-en) slik IDUN-dokumentasjonen angir, og lim inn nøkkelen i **Personlig API-nøkkel**.
4. Trykk **Hent modeller** og velg en modell, eller skriv navnet i **Modell**. Modeller uten reasoning svarer raskest.
5. Velg **Lagring**: **Husk på denne enheten** på din egen datamaskin, **Denne fanen** på en delt datamaskin. Trykk **Lagre innstillinger**.
6. Skriv et svar, trykk **Sjekk**, og trykk deretter **Tilbakemelding**. I Python-cellene trykker du **Tilbakemelding** ved kodevinduet.

Innstillingene gjelder for alle oppgaver og Python-celler på nettstedet. Har du lagret innstillinger i den tidligere versjonen av nettstedet, viser dialogen en knapp **Bruk lagrede innstillinger fra …** som fyller inn feltene; trykk deretter **Lagre innstillinger**.

::: {.callout-important title="Beskytt API-nøkkelen"}

Ikke skriv nøkkelen i Python-kode, del den med andre eller legg den i Git. På en delt datamaskin velger du **Denne fanen** under **Lagring**; da huskes nøkkelen bare i denne fanen.
:::

#### Få mest mulig ut av tilbakemeldingen

- Send inn et svar som du har fått selv; da kan modellen kommentere det du faktisk har gjort. 
- Bruk hintet til å endre svaret før du ber om neste nivå.
- Kontroller at du svarer i formatet oppgaven ber om, for eksempel brøk, desimaltall eller bitstreng.
- Rapporter til faglærer dersom tilbakemeldingen bruker feil forutsetninger eller avslører løsningen for tidlig. 

### Problemer og forbedringsforslag

Finner du en feil i en oppgave, et løsningsforslag eller i visningen, bruk
lenken **Rapporter et problem** i innholdsfortegnelsen på siden, eller åpne en
[sak i GitHub-repoet](https://github.com/TobyJavascript/2027v-TMA4411/issues).
Du kan også gi beskjed til emneansvarlig. Ta med sidenavn, oppgave,
hva du gjorde og hva du forventet skulle skje. Skjermbilde og nettlesernavn er
nyttig ved visningsproblemer.

### Om nettstedet

Innholdet bygger på framdriftsplanen, flervalgsoppgavene og forelesnings- og plenumsmateriellet i
TMA4411 Matematikk 2B våren 2026, omarbeidet til interaktive oppgaver med
løsningsforslag.

De interaktive komponentene kommer fra [CTM Assessment](https://github.com/Erasmus-CTM/ctm-assessment),
utviklet i Erasmus+-prosjektet «Computational Thinking makes sense of
Mathematics» (prosjekt nr. 2023-1-NO01-KA220-HED-000166744). Oppsettet følger
[kursnettstedet for Matematikk 3A](https://aacchhee.github.io/ingmat3a_ntnu/)
av Andrey Chesnokov.

:::

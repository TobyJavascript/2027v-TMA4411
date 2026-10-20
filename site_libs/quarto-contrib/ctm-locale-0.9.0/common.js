/* CTM Assessment message catalogue: common. Edit the JSON only (scripts/check-locales.py).
 * Messages every component shows the same way (Stop, Python loading, an
 * exercise shown without AI feedback). */
CTMLocales.add("common",
/*BEGIN-JSON*/
{"$languages": ["en", "de", "nb"],
 "en": {
  "stop": "Stop",
  "stopped": "Stopped. Python was restarted (interactive cells on this page lost their variables).",
  "slowLoad": "Python is still loading.",
  "withoutAI": "This exercise has no automatic feedback in this version."
 },
 "de": {
  "stop": "Abbrechen",
  "stopped": "Abgebrochen. Python wurde neu gestartet (interaktive Zellen auf dieser Seite haben ihre Variablen verloren).",
  "slowLoad": "Python wird noch geladen.",
  "withoutAI": "Diese Aufgabe hat in dieser Version keine automatische Rückmeldung."
 },
 "nb": {
  "stop": "Avbryt",
  "stopped": "Avbrutt. Python ble startet på nytt (interaktive celler på denne siden mistet variablene sine).",
  "slowLoad": "Python lastes fortsatt inn.",
  "withoutAI": "Denne oppgaven har ingen automatisk tilbakemelding i denne versjonen."
 }}
/*END-JSON*/
);

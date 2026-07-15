# Replay-Parser (WebAssembly)

Quellcode für den Match-Replay-Parser auf `/replays`. Ein kleiner Go-Wrapper um
[r6-dissect](https://github.com/redraskal/r6-dissect), der nach WebAssembly
kompiliert wird und `.rec`-Replays **komplett lokal im Browser** parst — kein
Upload, kein Server, kein Größenlimit.

## Neu bauen

Erzeugt `public/wasm/r6dissect.wasm` und kopiert Gos WASM-Laufzeit dazu:

```bash
cd wasm
GOOS=js GOARCH=wasm go build -o ../public/wasm/r6dissect.wasm .
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../public/wasm/wasm_exec.js
```

Die gebaute `.wasm` ist im Repo eingecheckt, damit Vercel **kein** Go-Toolchain
zum Deployen braucht — nur nach einer Änderung an `main.go` oder einem
r6-dissect-Update neu bauen.

## Ausgabeformat

`window.r6ParseReplay(Uint8Array)` liefert pro `.rec`-Datei (= eine Runde) einen
JSON-String im gleichen Schema wie `r6-dissect <file> -f json`: Header-Felder
flach + `matchFeedback` + `stats`. Die Aggregation mehrerer Runden zu einem
Match und das UI-Rendering passieren clientseitig in
`src/lib/replayParser.ts` bzw. `src/components/ReplayScorecard.tsx`.

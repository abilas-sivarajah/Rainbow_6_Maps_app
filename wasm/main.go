//go:build js && wasm

// WebAssembly-Wrapper um r6-dissect. Exponiert eine JS-Funktion
// r6ParseReplay(Uint8Array) -> JSON-String, die genau EINE .rec-Datei (eine
// Runde) parst. Das JSON-Schema entspricht 1:1 dem, was die r6-dissect-CLI
// mit `-f json` für eine Einzeldatei ausgibt (Header-Felder flach +
// matchFeedback + stats), damit die vorhandene Scorecard-UI unverändert passt.
package main

import (
	"bytes"
	"encoding/json"
	"syscall/js"

	"github.com/redraskal/r6-dissect/dissect"
	"github.com/rs/zerolog"
)

func init() {
	// r6-dissect loggt sehr gesprächig auf Debug-Level — im Browser wäre das
	// nur Rauschen in der Konsole.
	zerolog.SetGlobalLevel(zerolog.Disabled)
}

// gleiche Struktur wie writeRound() in r6-dissect/main.go
type roundOutput struct {
	dissect.Header
	MatchFeedback []dissect.MatchUpdate      `json:"matchFeedback"`
	PlayerStats   []dissect.PlayerRoundStats `json:"stats"`
}

func errJSON(msg string) string {
	b, _ := json.Marshal(map[string]string{"error": msg})
	return string(b)
}

func parseReplay(_ js.Value, args []js.Value) any {
	if len(args) < 1 {
		return errJSON("no data passed")
	}
	n := args[0].Get("length").Int()
	data := make([]byte, n)
	js.CopyBytesToGo(data, args[0])

	r, err := dissect.NewReader(bytes.NewReader(data))
	if err != nil {
		return errJSON("Datei konnte nicht gelesen werden: " + err.Error())
	}
	if err := r.Read(); !dissect.Ok(err) {
		return errJSON("Replay-Parsing fehlgeschlagen: " + err.Error())
	}

	out := roundOutput{
		Header:        r.Header,
		MatchFeedback: r.MatchFeedback,
		PlayerStats:   r.PlayerStats(),
	}
	b, err := json.Marshal(out)
	if err != nil {
		return errJSON("JSON-Serialisierung fehlgeschlagen: " + err.Error())
	}
	return string(b)
}

func main() {
	js.Global().Set("r6ParseReplay", js.FuncOf(parseReplay))
	// am Leben halten, damit die exportierte Funktion aufrufbar bleibt
	select {}
}

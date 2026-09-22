# nimble-systemone

Score typed yes/no and choice questions over text with Bespoke Nimble via Modal /v1/systemone.

Use this when the user wants structured decisions from text: boolean (yes/no) or choice questions with probabilities.

## Requirements

- `curl` installed
- `jq` installed
- `NIMBLE_BASE_URL` environment variable (optional; defaults to `https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct`)
- `NIMBLE_API_TOKEN` secret (optional; only if your Modal app is not public). Put it in the OpenClaw protected secret store and reference it as an env variable — never paste the raw token into `openclaw.json` or this skill file.

## Endpoint

```
POST ${NIMBLE_BASE_URL:-https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct}/v1/systemone
```

## Authentication

If `NIMBLE_API_TOKEN` is available (from the secret store / env), send header:

```
Authorization: Bearer $NIMBLE_API_TOKEN
```

Otherwise call with no authentication.

## Request shape

```json
{
  "model": "nimble-latest",
  "state": "<source text>",
  "questions": {
    "<id>": {
      "type": "noul",
      "instructions": "<yes/no question>"
    },
    "<id2>": {
      "type": "choice",
      "instructions": "<question>",
      "criteria": {
        "<label>": "<meaning>"
      }
    }
  }
}
```

## Steps

1. Read the source text the user wants scored.
2. Build the `questions` object — each question needs a unique id and either `type: "noul"` or `type: "choice"`.
3. POST JSON to `${NIMBLE_BASE_URL:-https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct}/v1/systemone` using `curl`.
4. Parse the response with `jq` and return the scored answers with probabilities/confidence.

## Example curl

```bash
NIMBLE_BASE_URL="${NIMBLE_BASE_URL:-https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct}"

curl -sS "$NIMBLE_BASE_URL/v1/systemone" \
  ${NIMBLE_API_TOKEN:+-H "Authorization: Bearer $NIMBLE_API_TOKEN"} \
  -H "Content-Type: application/json" \
  -d @- <<'EOF' | jq .
{
  "model": "nimble-latest",
  "state": "The patient reports chest pain radiating to the left arm.",
  "questions": {
    "chest_pain": {
      "type": "noul",
      "instructions": "Does the text describe classic angina?"
    }
  }
}
EOF
```

## Enabling the skill

In `~/.openclaw/openclaw.json`, add under `skills.entries`:

```json
{
  "skills": {
    "entries": {
      "nimble-systemone": {
        "enabled": true,
        "env": {
          "NIMBLE_BASE_URL": "https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct"
        }
      }
    }
  }
}
```

If your Modal app requires a token, store `NIMBLE_API_TOKEN` in the OpenClaw protected secret store and reference it as an env variable rather than pasting the raw value.

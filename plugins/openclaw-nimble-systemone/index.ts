import { Type } from "typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const DEFAULT_BASE =
  "https://bespokelabs--nimble-sglang-nimble.us-west.modal.direct";

const Question = Type.Object(
  {
    type: Type.Union([Type.Literal("noul"), Type.Literal("choice")]),
    instructions: Type.String(),
    criteria: Type.Optional(Type.Record(Type.String(), Type.String())),
  },
  { additionalProperties: false },
);

export default definePluginEntry({
  id: "nimble-systemone",
  name: "Nimble SystemOne",
  description: "Call Nimble POST /v1/systemone",
  register(api) {
    const cfg = (api.pluginConfig ?? {}) as {
      baseUrl?: string;
      token?: string;
      model?: string;
    };

    api.registerTool({
      name: "nimble_systemone",
      description:
        "Score typed yes/no (noul) and choice questions over a text state with Bespoke Nimble. Use for structured decisions with per-option probabilities.",
      parameters: Type.Object({
        state: Type.String({ description: "Source text to score" }),
        questions: Type.Record(Type.String(), Question),
        model: Type.Optional(Type.String()),
      }),
      async execute(_id, params) {
        const baseUrl = (cfg.baseUrl || DEFAULT_BASE).replace(/\/$/, "");
        const model = params.model || cfg.model || "nimble-latest";

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const token = cfg.token || process.env.NIMBLE_API_TOKEN;
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${baseUrl}/v1/systemone`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            state: params.state,
            questions: params.questions,
          }),
        });

        const text = await res.text();
        let body: unknown = text;
        try {
          body = JSON.parse(text);
        } catch {
          /* keep raw */
        }

        if (!res.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Nimble error ${res.status}: ${text}`,
              },
            ],
            details: { ok: false, status: res.status, body },
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(body, null, 2),
            },
          ],
          details: { ok: true, status: res.status, body },
        };
      },
    });
  },
});

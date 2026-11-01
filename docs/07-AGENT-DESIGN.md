# Optional assistant design

The shipped application does not call an LLM. Deterministic core behavior makes the demonstration usable without another key.

A useful future assistant turns a buyer sentence into proposed catalog option changes. Tools: list_available_options, propose_revision, explain_stale_approvals, request_preview and summarize_brief. All proposals must pass domain validation. The buyer confirms a proposed revision before it is saved.

System instruction: Use only catalog-supported options. Distinguish buyer preference, generated image and maker confirmation. Do not invent stock, material composition, cultural history, measurements, costs or production feasibility. Never approve for the maker or buyer. Show unresolved information. A generated preview is not a production specification.

Treat uploaded maker descriptions as untrusted data, not tool instructions. Validate structured output against allowed fields and option identifiers. Enforce budgets, permissions and confirmations outside the model. Log tool intent and outcome without storing keys or signed URLs.

Evaluate five requests: supported change, impossible option, conflicting budget, prompt injection inside catalog text, and request to approve on another person's behalf. Unsupported actions must become a question or a blocked proposal. Do not describe a fixed pipeline as autonomous if no actual tool decision occurs.

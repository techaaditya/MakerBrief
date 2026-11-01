# YouCam integration

Reference checked 31 October 2026: https://docs.perfectcorp.com/reference/ai_clothes/v4.0

The implemented server adapter sends POST /s2s/v2.0/task/cloth-v4 on https://yce-api-01.makeupar.com with Bearer authentication. It supplies source and reference HTTPS URLs, category outer, strict multi-person filtering and change_shoes false. It retains task_id and polls the corresponding GET status route. Verify your entitlement and exact response against your console.

## Configure

Set YOUCAM_API_KEY privately, ENABLE_LIVE=true, IMAGE_HOSTS to comma-separated exact hosts you control, and MAX_LIVE_JOBS to a small total cap. Keep .env out of git. The UI requires explicit consent before sending images. The key is never returned to the browser.

The source URL must contain a suitable permissioned person photograph. The reference must depict the actual outerwear being previewed. Both must be retrievable by the provider. Use suitably scoped signed URLs with enough lifetime for processing. Do not publish personal photos in your source repository.

The sample does not implement File API uploads. To add them, use the current File Management reference: request an upload destination, send the actual bytes to the returned URL with its required headers, then use the resulting file identifier in the selected endpoint's supported schema. Requesting an upload destination alone does not upload the file.

## Live verification checklist

Record input permission, reference revision, endpoint version, parameters, start/end time, successful status, response shape and actual balance debit. Check the output with the maker: collar, trim, closures, garment pattern, face and retained appearance. An HTTP 200 can still contain engine failure. Unknown result shapes must fail explicitly.

No live call was run for this kit. The source includes mocked provider tests, not an independently verified integration on your account. Replace illustrative evidence only after a genuine authorized transaction.

Clothes V4 cost is not assumed. Measure or query the current feature cost. Do not base the budget on another version's published cost. No arbitrary custom swatch upload is implemented; the reviewed Fabric V1 flow uses predefined templates.

The browser displays the provider result directly. Temporary result URLs may expire. For judge access, add permitted private result storage and a clearly labeled recorded-real-result path. Server-side download requires strict destination validation, size limits, redirect handling and protection against private-network URLs.

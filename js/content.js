/* Content for the interactive parts of the study guide. Every "code" list holds ids from tools/entries.py,
   so each explanation opens the exact lines in the repositories. */
window.STUDY_CONTENT = {
  // ---------------------------------------------------------------- architecture
  architecture: {
    browser: {
      title: "Visitor's browser: the Scan page",
      lines: [
        "Runs frontend/js/scanner.js on the Scan page (pages/new-scanner.html).",
        "Checks the file itself (format, size, length, resolution) and, with Auto, measures how it looks.",
        "Asks /api/capacity, uploads with progress (XMLHttpRequest) or sends the link, then asks for the job every 3 seconds.",
        "Draws the result card and the evidence pictures; keeps the job in the address (#job=) so a reload resumes it.",
      ],
      code: ["js-api-base", "js-select-file", "js-auto-measure", "js-submit", "js-post-analysis", "js-follow-job", "js-render-result"],
    },
    render: {
      title: "Render web server: FastAPI (backend/server.py)",
      lines: [
        "One Python program serves the pages (the obfuscated frontend-dist build) and the whole API.",
        "Checks every video with PyAV before it costs a GPU scan, and fetches links with yt-dlp.",
        "Keeps the line: 3 scans on the GPU at once, up to 50 waiting, in arrival order.",
        "Holds the Vast API key (the browser never sees it) and stores each result for 1 hour.",
      ],
      code: ["frontend-dir", "mount-static", "create-analysis", "probe-upload", "the-line", "run-vast-job", "store-heatmaps"],
    },
    platforms: {
      title: "Social media platforms",
      lines: [
        "TikTok, Facebook, X and Reddit links are read by the server with yt-dlp.",
        "Only public videos; only the platform's own hosts; every redirect re-checked.",
        "Reddit refuses Render's server address since October 13, 2026.",
      ],
      code: ["platforms", "match-platform", "ls-download", "ls-fetch"],
    },
    vast: {
      title: "Vast.ai endpoint: originai-detectors",
      lines: [
        "Vast's router answers 'which worker is ready?' and its autoscaler starts or rents a GPU when none is.",
        "Worker group rules: an RTX 5090, 12+ CPU cores, a static IP, at most $0.50 an hour.",
        "A new machine takes 15 to 30 minutes to become ready (cold start); a stopped worker about 30 seconds.",
      ],
      code: ["vast-endpoint", "vast-route", "vast-request"],
    },
    worker: {
      title: "GPU worker on a rented RTX 5090 (originai-vast)",
      lines: [
        "Vast's PyWorker (port 3000) passes each signed /analyze request to the model server (port 18000).",
        "Downloads the video from the Render server by its random name, into a temporary folder.",
        "Runs the thesis preprocessing, scores every frame with the study's network (or DFD-FCG for Vidi), adds the second check and evidence maps.",
        "Runs up to 3 scans at once (ScanGate).",
      ],
      code: ["worker-py", "app-write-video", "app-analyze", "analyze-main", "scan-gate"],
    },
    b2: {
      title: "Backblaze B2: private bucket salik-digma",
      lines: [
        "Holds the four checkpoints (about 2.3 GB).",
        "Each worker downloads them when it starts with a read-only key, and checks every SHA-1 against models.json.",
      ],
      code: ["fetch-weights", "models-json"],
    },
    github: {
      title: "GitHub: the two repositories",
      lines: [
        "originai-website (private): a push to main makes Render rebuild and redeploy the site in about 2 minutes.",
        "originai-vast (public): a push builds the worker image on GitHub Actions into ghcr.io.",
        "A scheduled workflow checks the link platforms twice a day.",
      ],
      code: ["render-yaml", "build-main", "build-image", "link-health"],
    },
  },

  // ---------------------------------------------------------------- the journey of one scan
  journey: {
    upload: [
      { actor: "browser", title: "The visitor picks a file", text: "The page checks the format, the 250 MB limit, the length (10 s to 2 min) and the resolution (360p to 1080p) itself, so most problems show before anything is uploaded.", code: ["js-select-file", "js-read-metadata"] },
      { actor: "browser", title: "Auto measures how it looks", text: "With Auto selected, the page loads the file into a hidden video, draws 6 points of it on a canvas, and picks a detector with the same rules as the server.", code: ["js-auto-check", "js-auto-measure", "js-auto-rules"] },
      { actor: "browser", title: "Scan is pressed", text: "The page waits up to 8 seconds for Auto, then asks GET /api/capacity whether a scan fits, so a full line costs no upload.", code: ["js-submit", "capacity-endpoint"] },
      { actor: "render", title: "The upload arrives", text: "RequestGuard refuses an oversized body from its header. create_analysis streams the file in 1 MB chunks to backend/outputs/vast_uploads/<random name>.", code: ["request-guard", "create-analysis", "storage-paths"] },
      { actor: "render", title: "PyAV checks the video", text: "The server opens the file with PyAV, decodes one frame, and enforces the length and frame-size rules. A refused file is deleted and the answer is a 400 with a code.", code: ["probe-upload", "read-video-file", "check-rules"] },
      { actor: "render", title: "The job joins the line", text: "The scan is counted and the job created with no await in between; it gets a random id and waits for one of the GPU's 3 places. The answer is 202 with the job.", code: ["start-job", "the-line", "capacity-problem"] },
      { actor: "vast", title: "The server asks Vast for a ready worker", text: "When the job's turn comes, the server asks Vast's router which worker is ready, waiting through a cold start if needed (up to 45 minutes).", code: ["run-vast-job", "vast-request", "vast-route"] },
      { actor: "worker", title: "The worker gets the video", text: "The server posts the scan to the worker with Vast's signature. The worker downloads the video from /api/uploads/<name> into a temporary folder.", code: ["get-upload", "app-write-video", "app-analyze"] },
      { actor: "worker", title: "The GPU analyzes it", text: "Decode, find and align the face, follow one person, score every frame in 16-frame clips at the trained spacing, run the thesis protocol, render evidence maps.", code: ["analyze-main", "face-read", "phase-clips", "score-clips", "readout"] },
      { actor: "render", title: "The answer is stored", text: "The server writes the evidence pictures to backend/outputs/analyses/<job id>/, stores the result in the job, frees the GPU place and deletes the upload.", code: ["run-vast-job", "store-heatmaps"] },
      { actor: "browser", title: "The page polls and shows the result", text: "Every 3 seconds the page asks GET /api/analyses/<id>; when the job is completed it draws the verdict, how sure, How This Was Checked and the evidence.", code: ["js-follow-job", "get-analysis", "js-render-result", "js-how-sure"] },
      { actor: "render", title: "One hour later", text: "The result and its pictures expire one hour after the check finished; the clean-up removes them, and the #job link then says the result is gone.", code: ["public-job", "save-state"] },
    ],
    link: [
      { actor: "browser", title: "The visitor pastes a link", text: "The page checks the platform against the switched-on list, then asks the server to look it up.", code: ["js-look-up-link", "link-sources-endpoint"] },
      { actor: "render", title: "The server looks the link up", text: "match_platform refuses IP addresses, usernames and odd ports and accepts only platform hosts. yt-dlp reads the title, length and quality without downloading.", code: ["server-inspect", "match-platform", "ls-inspect", "ydl-options"] },
      { actor: "platforms", title: "Share links are followed safely", text: "Short share links are followed by the server one hop at a time, each hop kept on the platform's own hosts.", code: ["resolve-tiktok"] },
      { actor: "browser", title: "Scan is pressed", text: "The page sends POST /api/analyses/link with the link and the detector (or auto). The job starts at stage fetching.", code: ["js-submit", "server-create-link", "link-limit"] },
      { actor: "platforms", title: "The video is downloaded", text: "The sharpest version between 360p and 1080p is downloaded into backend/outputs/vast_uploads/, stopped past 250 MB, then checked with PyAV like an upload.", code: ["server-link-job", "ls-download", "ls-rank-formats", "ls-fetch", "read-video-file"] },
      { actor: "render", title: "Auto runs on the server", text: "With Auto, the server measures the downloaded video, then checks that the visitor didn't cancel meanwhile before the job joins the line.", code: ["server-auto", "vq-read", "vq-choose"] },
      { actor: "worker", title: "From here it is the same as an upload", text: "The job waits for a GPU place, the worker analyzes the video, and the page shows the result.", code: ["the-line", "run-vast-job", "analyze-main", "js-render-result"] },
    ],
  },

  // ---------------------------------------------------------------- job stages
  lifecycle: {
    scan: { title: "Scan pressed", text: "The page checks the file (and with Auto picks a detector), then asks /api/capacity whether a scan fits.", code: ["js-submit", "capacity-endpoint"] },
    accept: { title: "Server accepts it: job created (202)", text: "Uploads are checked with PyAV first; links are checked for the platform. The job gets a random id.", code: ["create-analysis", "server-create-link", "start-job"] },
    refused: { title: "Refused: no job (400)", text: "Too short, too long, not a video, wrong format... The answer carries a code and a sentence; nothing reaches the GPU and no scan is counted.", code: ["probe-upload", "check-rules", "api-errors"] },
    fetching: { title: "fetching (links only)", text: "The server downloads the link's video (at most 3 downloads at once). Cancel works here. A link that can't be downloaded, or whose video breaks a rule, ends as failed with a reason.", code: ["server-link-job", "ls-download", "explain-error"] },
    queued: { title: "queued", text: "Waiting for one of the GPU's 3 places, up to 50 in line. GET /api/analyses/<id> includes the place in line. Cancel works here.", code: ["the-line", "public-job"] },
    analyzing: { title: "analyzing", text: "On the GPU. It can no longer be canceled: POST .../cancel answers 409 already_running.", code: ["run-vast-job", "cancel-endpoint"] },
    completed: { title: "completed", text: "The result is stored with links to its evidence pictures, and kept for one hour after it finished.", code: ["run-vast-job", "store-heatmaps", "public-job"] },
    canceled: { title: "canceled", text: "Taken out of the line; the scan is given back to the day's count and the upload deleted.", code: ["the-line", "cancel-endpoint", "js-cancel"] },
    failed: { title: "failed", text: "No face, an unreadable video, a timeout or an unreachable GPU. The job carries a reason code and a plain sentence.", code: ["run-vast-job", "js-failure-messages", "app-analyze"] },
  },

  // ---------------------------------------------------------------- the API
  api: [
    { method: "GET", path: "/api/health", what: "Whether the server is ready, which detectors it forwards to, and the running commit. 503 if the built pages are missing.", example: "get_health", fresh: true, code: ["health"], curl: "curl https://real-originai.com/api/health" },
    { method: "GET", path: "/api/models", what: "The four detectors with their public names and datasets.", example: "get_models", fresh: true, code: ["models-endpoint", "media-fields"], curl: "curl https://real-originai.com/api/models" },
    { method: "GET", path: "/api/capacity", what: "Whether a new scan is accepted now, how long the page should wait (scan_timeout_seconds), the line, and the video limits. The Scan page asks this before every upload.", example: "get_capacity", fresh: true, code: ["capacity-endpoint", "capacity-problem"], curl: "curl https://real-originai.com/api/capacity" },
    { method: "GET", path: "/api/link-sources", what: "The link platforms switched on (the Links from chips) and the known ones that are off.", example: "get_link-sources", fresh: true, code: ["link-sources-endpoint", "platforms"], curl: "curl https://real-originai.com/api/link-sources" },
    { method: "POST", path: "/api/links/inspect", what: "A link's title, length and quality without downloading. Body: {\"url\": \"...\"}. Counts toward the 300-per-10-minutes link limit.", example: "recorded_link_inspect", errors: ["recorded_err_inspect_YouTube", "recorded_err_inspect_other_site", "recorded_err_inspect_not_a_link"], code: ["server-inspect", "match-platform", "ls-inspect"], curl: "curl -X POST https://real-originai.com/api/links/inspect -H \"Content-Type: application/json\" -d '{\"url\": \"https://www.tiktok.com/@user/video/123\"}'" },
    { method: "POST", path: "/api/analyses", what: "Starts a check of an uploaded file. Multipart form: video (the file), model (veni-hq, veni-lq, vidi, vici or auto); with Auto also auto_reason, auto_instead_of, avoid. Answers 202 with the job.", example: "recorded_scan_veni_started", errors: ["recorded_err_upload_5_s", "recorded_err_upload_240p", "recorded_err_upload_1440p", "recorded_err_upload_not_a_video", "recorded_err_upload_txt", "recorded_err_upload_unknown_model"], code: ["create-analysis", "request-guard", "probe-upload"], curl: "curl -F \"video=@clip.mp4\" -F \"model=auto\" https://real-originai.com/api/analyses" },
    { method: "POST", path: "/api/analyses/link", what: "Starts a check of a link. Body: {\"url\": \"...\", \"model\": \"auto\", \"avoid\": [...]}. The job starts at stage fetching while the server downloads the video.", example: "recorded_scan_link_started", code: ["server-create-link", "server-link-job"], curl: "curl -X POST https://real-originai.com/api/analyses/link -H \"Content-Type: application/json\" -d '{\"url\": \"https://www.tiktok.com/@user/video/123\", \"model\": \"auto\"}'" },
    { method: "GET", path: "/api/analyses/{id}", what: "The job: status, stage, place in line while queued, and the full result when completed (or reason and error when failed). The page asks every 3 seconds.", example: "recorded_scan_vidi_done", errors: ["recorded_scan_failed_done", "recorded_err_GET_unknown_id"], code: ["get-analysis", "public-job"], curl: "curl https://real-originai.com/api/analyses/<id>" },
    { method: "POST", path: "/api/analyses/{id}/cancel", what: "Takes a check out of the line while its stage is fetching or queued. 409 already_running once the GPU has it; 409 finished afterwards.", example: "recorded_link_canceled", errors: ["recorded_err_cancel_running"], code: ["cancel-endpoint", "the-line"], curl: "curl -X POST https://real-originai.com/api/analyses/<id>/cancel" },
    { method: "GET", path: "/api/analyses/{id}/media/{name}", what: "One evidence picture (JPEG), named like c3_f5_crop_heat.jpg, while the result exists.", code: ["media-endpoint", "store-heatmaps"], curl: "curl -o picture.jpg https://real-originai.com/api/analyses/<id>/media/c0_f0_frame.jpg" },
    { method: "GET", path: "/api/uploads/{name}", what: "Internal: how the GPU worker downloads the upload, by its random 192-bit name. Never cached; the file is deleted when the check ends.", code: ["get-upload", "name-patterns"] },
    { method: "GET", path: "/api/admin/...", what: "Hidden admin checks (client-address, check-link-platforms): 404 unless the secret X-Admin-Key header is right.", code: ["admin", "link-health"] },
    { method: "ANY", path: "Wrong method or address", what: "An endpoint called with the wrong method answers 405, and an unknown /api/ address 404, in the same {detail, code} shape as every other error. Other unknown addresses get the site's 404 page.", example: "live_err_wrong_method", errors: ["live_err_unknown_address"], fresh: true, code: ["error-handlers", "api-errors"], curl: "curl https://real-originai.com/api/links/inspect" },
  ],

  // ---------------------------------------------------------------- GPU pipeline steps
  pipeline: [
    { key: "decode", title: "Decode", text: "Frames are decoded on the CPU with torchcodec, bit-identical to the PyAV frames used in training. Portrait videos are turned upright.", code: ["face-read", "policy-json"] },
    { key: "detect", title: "Find the face", text: "MTCNN on the GPU with the training weights and thresholds (minimum face 40 px, confidence 0.9).", code: ["mtcnn"] },
    { key: "align", title: "Line it up", text: "Each face is warped to the ArcFace five-point template at 224 x 224, pixel-identical to OpenCV.", code: ["warp-faces"] },
    { key: "track", title: "Follow one person", text: "FaceNet embeddings keep the same face from frame to frame, so the score is about one person.", code: ["tracker"] },
    { key: "phases", title: "Clips at the trained spacing", text: "k = round(spacing x fps) interleaved phases, each tiled into 16-frame clips, so every face frame is scored at the spacing the model learned.", code: ["phase-clips", "analyze-main"] },
    { key: "score", title: "Score each clip", text: "The detection network trained in the study gives each clip a logit, in bf16.", code: ["detector-network", "score-clips"] },
    { key: "readout", title: "Decide", text: "Mean clip logit / temperature -> sigmoid -> compared with the threshold.", code: ["readout", "models-json"] },
    { key: "protocol", title: "Second check", text: "The thesis protocol: 48 tracked frames, three anchored clips; reported next to the whole-video answer.", code: ["eval-anchors", "score-clips"] },
    { key: "evidence", title: "Evidence maps", text: "Each final-stage token's exact share of the logit (Grad-CAM at the last norm layer), for the most suspicious moments and the least.", code: ["detector-network", "render-maps"] },
  ],

  // ---------------------------------------------------------------- deployment
  deploy: [
    { title: "Push to main", text: "A change is pushed to originai-website on GitHub.", code: [] },
    { title: "Render builds", text: "pip install (always the newest yt-dlp), then node build/build.mjs makes the obfuscated frontend-dist.", code: ["render-yaml", "build-rules", "build-main"] },
    { title: "Health check", text: "Render starts the new server and calls /api/health, which fails if frontend-dist is missing.", code: ["health", "frontend-dir"] },
    { title: "Live", text: "About 2 minutes after the push; /api/health reports the new commit.", code: ["mount-static", "headers"] },
  ],
};

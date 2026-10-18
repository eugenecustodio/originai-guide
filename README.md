# OriginAI Guide

How [real-originai.com](https://real-originai.com) works, step by step: the website, the API and the GPU that runs the deepfake detectors, with every function linked to where it lives in the code.

**Open it: https://eugenecustodio.github.io/originai-guide/**

You can also download this repository (**Code → Download ZIP**), unzip it and open `index.html`. It works without an internet connection.

## What is inside

| Section | What it shows |
| --- | --- |
| Architecture | Who talks to whom: the browser, the Render server, Vast.ai, the GPU worker, Backblaze and GitHub. Click a part to see its role and where its code is. |
| Life of a scan | A step-by-step walk through an upload (12 steps) and a link (7 steps), with the working part highlighted. |
| Job stages | The statuses the API reports (`fetching`, `queued`, `analyzing`, `completed`, `canceled`, `failed`) as a clickable diagram. |
| The API | Every public endpoint, with a curl command and real answers from the live site. |
| Video checks and links | The upload rules checked with PyAV, and how links are fetched with yt-dlp. |
| GPU pipeline | The nine steps on the GPU, plus a calculator for the interleaved phases (k = round(spacing × fps)) that reproduces a real scan. |
| Reading a result | A "how sure" calculator that uses the same arithmetic as the result card. |
| Detectors and Auto | The four detectors, and an Auto simulator with the same rules the website uses. |
| Hosting, deploys, limits | Render, Vast.ai, Backblaze, the obfuscation build, and the safety limits. |
| Code map | Every function and setting the guide refers to, searchable. |

## About the code

- Functions in the public [originai-vast](https://github.com/eugenecustodio/originai-vast) repository (the GPU worker) are shown in full, with links to their exact lines.
- The website's own repository, `originai-website`, is private, so its functions are listed with their file, lines and description, without their code.
- All references are pinned to the versions that were live on October 18, 2026: website `2daaf09`, GPU worker `0453e98`.

This is the public edition of a study guide made for the OriginAI thesis defense.

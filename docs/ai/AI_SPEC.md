# AI and Intelligence Specification — KINNIPAW

## Principles

AI is an optional assistance layer, not a dependency of core workflows. The platform must remain usable when the provider is unavailable or free quota is exhausted. All AI calls execute server-side through a provider abstraction.

## Features

### 1. Animal-care educational assistant

Input: question plus minimal relevant species/age/context. Output: general educational information, uncertainty, source references where available and clear veterinarian referral for concerning signs. Never diagnose, prescribe medicines/doses, or replace professional care.

### 2. Lost/found candidate ranking

Start with rules: species, color, breed when known, date proximity, generalized location proximity and distinctive markings. Later, optional image embeddings/visual similarity can add candidate ranking. Always label as possible matches; a human confirms identity.

### 3. Adoption compatibility suggestions

Use transparent, explainable factors such as adopter time/care capacity, living arrangement, prior experience and pet-specific needs. Do not auto-approve/reject people or animals.

### 4. Listing description assistance

Generate an editable draft from owner-provided facts. Never invent health status, vaccination, behaviour or pedigree claims.

### 5. Moderation assistance

Flag possible spam/scam/abuse risks for human review. AI cannot be the sole basis for account suspension or final abuse findings.

## Architecture

```text
Client -> API auth -> Zod validation -> quota/rate limit
       -> task router -> provider adapter -> output schema validation
       -> result + minimal job metadata -> user/human review
```

## Cost/privacy controls

- Per-user daily quota and per-IP protection.
- Prompt, attachment, image-size and response limits.
- Timeout, retry budget and circuit breaker.
- Cache safe repeatable educational answers where appropriate.
- No personal contact/address/precise location unless strictly necessary and consented.
- Do not send private health documents or messages to AI by default.
- Review provider free-tier data handling and training terms before use.
- Store hashes/status/provider metadata rather than full sensitive prompts where possible.
- Provide deterministic fallback.

## Matching score

Initial illustrative heuristic only (must be calibrated against labelled examples): species 25%, generalized location 20%, distinctive markings 20%, color 15%, date proximity 10%, breed 10%. Missing values should be reweighted, not treated as mismatches. Do not expose score as probability of identity.

## Evaluation

Build a small manually reviewed test set, measure false positives and false negatives, record confidence limitations, and require human confirmation. Never claim a match is certain.

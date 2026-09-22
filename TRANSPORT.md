# Taxi transport

Text and ASL use the same destination catalog and request builder. ASL has its own
presentation in `components/ASLComponents/ASLTaxiRequestModal.tsx`.

## Editable resources

- Destinations, category order, coordinates, place IDs and photos: `data/taxiDestinations.ts`.
- ASL destination fingerspelling: `data/aslAlphabet.ts` maps the 26 local PNGs in
  `assets/images/ASL-letras/`. The destination hand button opens a bottom sheet
  with its category icon and title (mockup 1.2). Letters scroll horizontally
  automatically, pausing briefly at the start and end before repeating.
  Touching the letters stops autoplay until the panel is reopened, allowing
  manual scrolling. Reduced-motion preferences disable autoplay.
  `fingerspellingText` in `data/taxiDestinations.ts` optionally overrides the text;
  otherwise the current `label` is spelled. Accents are normalized to A-Z,
  spaces separate words, and numbers/punctuation remain visible as text.
  Images are contained in full, including the movement arrows for J and Z.
- Validated ASL illustrations/GIFs: `data/taxiAslResources.ts`. Keys are destination
  IDs or step titles. Destination resources appear above fingerspelling;
  missing step resources display a pending placeholder. Fingerspelling spells
  the configured name and is not a translation of a destination description.
- Date, time, passenger options, payload and map URL helpers: `data/taxiRequest.ts`.
- ASL icon colors and time-of-day tones: `constants/transportAslTheme.ts`.
  ASL uses the centered overlay, rounded container and outlined/green actions of
  the Text taxi modal, with independently colored visual choices.
- Google static map preview uses `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`; without a usable
  preview the ASL view still offers Open map. The map is read-only.

Requests require at least 24 hours notice, measured in `America/Mexico_City` and
persisted as an ISO instant. 48 hours is recommended, with no maximum advance
booking. Both modes allow 1-6 passengers and the six configured time slots.

## Proposals

The guest first sends a request. Staff then publishes options with total capacity,
vehicle count and total MXN cost. Both histories open a selector; ASL uses visual
vehicle/price cards. Accepting sends only request ID, revision and option ID.
The UI waits for a server acknowledgement before showing acceptance.
Staff can add up to 20 alternatives, each with optional guest-facing details
(vehicle model, luggage space or amenities). Revising starts with the published
options prefilled. Both mobile modes display these details before and after
acceptance. Text uses labeled icon rows for vehicles, capacity, total and trip
details. History modals and ASL cards follow the active app/device theme through
`hooks/useTransportTheme.ts`, including selected, pending and cancelled states.

Staff assigns the accepted number of vehicles, each with plate, model and optional
color. New prices require a new proposal revision and guest acceptance. Previous
revisions remain archived. Closing the selector keeps the request; Cancel asks
for confirmation before cancelling the whole request.

Legacy transport responses without proposals remain readable. Valet retains its
existing request and response workflow. Backend protocol details and tests are in
`../ASL-Web/server/TRANSPORT.md`.

## Verification

Run `npm run typecheck` and `npm run test:transport`. In environments that prohibit
test subprocesses, use `node --test --experimental-test-isolation=none
tests/transport.test.cjs tests/transportSocket.test.cjs` on a supporting Node version.
The tests use controlled clocks and mocked WebSockets, without production data.

Visual verification can use an isolated Expo render of the real components. Native
Android/iOS checks and an end-to-end test against MongoDB should also be performed
before release; isolated renders do not exercise native navigation or networking.

# HELLO AI — "Your Voice. Your Rights. Your AI Guide."

> **HELLO AI** is a voice-first, regional-language AI navigator designed primarily for first-time women users who may have little or no prior digital knowledge.

---

## 🌟 Product Philosophy

Digital systems shouldn't force users to learn complex menus, technical terminology, or cumbersome government portals. 

**HELLO AI adapts the digital system to the user.** A user simply speaks or types what she needs in her native language:
- *"I want help starting a small business."*
- *"I need government assistance."*
- *"I want to find a skill course."*
- *"I need help for my child's education."*

HELLO AI understands the intent, asks only essential information, matches verified government schemes, evaluates eligibility, breaks down required documents, and guides the user step-by-step toward official access.

---

## 🚀 Key Features

1. **Voice-First & Accessible UI**: Visually prominent, pulsing hero microphone with speech-to-text (`SpeechRecognition`) and text-to-speech (`SpeechSynthesis`) audio playback across all Indian locales.
2. **Pan-Indian Multilingual System (Phase 1.5)**: Full, first-class support for **13 canonical languages (12 Indian languages + English)**:
   - English (`en` / `en-IN`)
   - Tamil (`ta` / `ta-IN`)
   - Hindi (`hi` / `hi-IN`)
   - Telugu (`te` / `te-IN`)
   - Kannada (`kn` / `kn-IN`)
   - Malayalam (`ml` / `ml-IN`)
   - Marathi (`mr` / `mr-IN`)
   - Gujarati (`gu` / `gu-IN`)
   - Bengali (`bn` / `bn-IN`)
   - Punjabi (`pa` / `pa-IN`)
   - Assamese (`as` / `as-IN`)
   - Odia (`or` / `or-IN`)
   - Urdu (`ur` / `ur-IN`, full RTL support)
3. **100% Key & Placeholder Parity**: All 13 locale dictionaries adhere to the canonical 78-key dictionary structure with verified interpolation token preservation (`{score}`, `{date}`, `{field}`).
4. **Bidirectional & Logical RTL Layout**: Native Right-to-Left (RTL) support for Urdu using CSS logical properties (`border-start-start-radius`, `border-start-end-radius`, inline margins/padding) and dedicated `.chat-bubble-*` direction styling.
5. **Robust Localized Fallback Resolution**: `translateLocalizedText()` reliably cascades: Selected Locale → English Fallback → First Available Translation → Empty String. Zero raw object leaking or direct array indexing.
6. **State Preservation Across Language Switches**: Switching language updates presentation instantly without resetting chat conversation history, demographics, step progress, or guided answers.
7. **Structured Guided Answers**: Questions and answers pass as structured typed payloads (`fieldKey`, `value`) rather than translated conversational text, preserving backend data integrity.
8. **Deterministic Eligibility Engine**: Evaluates age, state, income, gender, and occupation rules using AND/OR logic, comparison operators (`>=`, `<=`, `==`, `in`, `boolean_true`), producing percentage match scores and clear explanations.
9. **Verified Service Data Architecture**: Structured government scheme models with verified authority metadata, eligibility criteria, document checklists with alternatives, and step-by-step guides.
10. **Server-side Gemini Conversation AI (Phase 2)**: Google Gen AI SDK structured JSON output, Zod validation, retry/fallback, multilingual conversation context, and a server-only API key.
11. **Privacy-First Session Management**: Privacy controls with 1-click session data deletion. Strict server-side rejection of invalid/unsupported language codes. Zero collection of passwords, OTPs, or Aadhaar numbers.
12. **Accessibility & High Contrast**: Built for low-literacy & first-time smartphone users with 48px+ touch targets, high-contrast mode, text scaling, and clean font hierarchies.

---

## 🏗️ Architecture & Folder Structure

```
HELLO AI/
├── app/
│   ├── layout.tsx                # App Root Layout with accessibility & themes
│   ├── page.tsx                  # Screen 1 & 2: Welcome Experience & Language Selector
│   ├── assistant/
│   │   └── page.tsx              # Screen 3, 4, 5: Voice/Text AI Assistant & Guided Questions
│   ├── services/
│   │   └── page.tsx              # Government Service Discovery Catalog
│   ├── progress/
│   │   └── page.tsx              # Screen 6: User Session, Profile & Privacy Clear
│   ├── globals.css               # Design system, high-contrast CSS & keyframe animations
│   └── api/                      # Server-side API endpoints
│       ├── chat/route.ts         # POST: AI intent & assistant turns
│       ├── services/             # GET: Service search & category filter
│       ├── eligibility/check/    # POST: Deterministic eligibility evaluation
│       └── session/              # GET/POST/DELETE: Session state management
├── components/
│   ├── ui/                       # Button, Card, Badge, LoadingSpinner, ErrorMessage
│   ├── accessibility/            # AccessibilityToolbar (High contrast, text scale)
│   ├── language/                 # LanguageSelector
│   ├── voice/                    # VoiceButton (Pulsing ripple microphone button)
│   ├── assistant/                # ChatMessage, QuestionCard, ServiceCard, EligibilityCard, DocumentCard, ApplicationStepCard, TypingIndicator, VoicePlaybackButton
│   ├── services/                 # ServiceCatalog
│   └── layout/                   # Header, Navigation
├── lib/
│   ├── ai/                       # AIService interface, MockAIService, GeminiAIService stub
│   ├── voice/                    # VoiceProvider interface & WebSpeechProvider implementation
│   ├── services/                 # ServiceRepository & MockServiceRepository
│   ├── eligibility/              # EligibilityEngine deterministic evaluation logic
│   ├── database/                 # IDatabaseAdapter & MemoryStorageAdapter
│   └── validation/               # Zod validation schemas for inputs & payloads
├── data/
│   ├── services/                 # Sample verified government schemes dataset
│   └── languages/                # Multilingual dictionary for English, Tamil, Hindi
├── hooks/
│   ├── useLanguage.ts            # Current language & translation helper
│   ├── useSession.ts             # Session & demographics state
│   ├── useVoice.ts               # Speech recognition & audio synthesis
│   └── useConversation.ts        # Message stream & AI response orchestration
├── types/                        # TypeScript type interfaces
├── __tests__/                    # Vitest unit test suite (Eligibility, Services, Validation)
└── README.md
```

---

## ⚡ Quick Start & Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
```bash
# Navigate to the project directory
cd HELLO-AI

# Install dependencies
npm install

# Create a local environment file and add your Gemini API key
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY (never commit .env.local)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build Verification

```bash
# Run unit & regression test suites (Vitest)
npm run test

# Run TypeScript type validation
npx tsc --noEmit

# Run Next.js linting
npm run lint

# Run production build
npm run build
```

The test suites validate:
- **`regression.test.ts`**: Interpolation, localized fallback, shared language switching, locale persistence, structured-answer persistence, no state loss on language switches, session language rejection, explicit-language detection precedence.
- **`locales.test.ts`**: Strict JSON parsing, U+FFFD prevention, 100% key parity, placeholder parity, and non-empty translation values across all 13 locales.
- **`i18n.test.ts`**: Canonical language configuration, BCP-47 locale mapping, text direction, script detection, and key resolution.
- **`eligibility.test.ts`**: Deterministic rule evaluation across comparisons, ranges, set membership, nested AND/OR groups, missing values, and unknown operators.
- **`validation.test.ts`**: Zod validation schemas for chat payloads, guided answers, and user demographics.
- **`services.test.ts`**: Category filtering, keyword search, sample-data suppression, and PMEGP source/partial-eligibility behavior.
- **`gemini.test.ts`**: Structured response parsing, retry, safe fallback, and canonical language context.
- **`conversation-controller.test.ts`**: Allowlisted information merge, sample-data suppression, no-match behavior, verified-service eligibility, non-disclosure, and service-context follow-ups.
- **`privacy.test.ts`**: Credential redaction, bounded request validation, and rejection of unsupported profile fields.

---

## 🔑 Environment Variables (`.env.local`)

```env
# Server-only Google Gemini API key; never expose it with NEXT_PUBLIC_.
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-flash-latest

# Client-safe environment settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

---

## 🤖 Phase 2 Conversation Architecture

Text and browser voice input use the same `/api/chat` controller. The server selects Gemini when `GEMINI_API_KEY` is configured, requests schema-constrained JSON through the official `@google/genai` SDK, validates it with Zod, and applies only allowlisted extracted fields. The controller maps intents to the existing service catalog and evaluates verified conditions deterministically, including recursive AND/OR rule groups. It preserves the selected service during follow-up questions. The UI receives one canonical `responseText`; voice playback reads that same text using the selected message locale.

The prompt and schema live under `lib/ai/prompts/` and `lib/ai/schemas/`; orchestration lives under `lib/ai/conversation/`. Gemini is not allowed to supply documents, application steps, official links, or eligibility decisions. Those remain controlled by catalog data and deterministic code.

---

## 🛡️ Security & Privacy Standards

- **Zero Sensitive Data Collection**: No passwords, PINs, OTPs, or bank account credentials are requested or stored.
- **Local Storage / Session Control**: Users can wipe all saved session demographics with a single click in the **My Progress** screen.
- **Server-Side Key Isolation**: `GEMINI_API_KEY` is used only by server-side AI modules and is never sent to the browser.
- **Safe AI Output**: The structured result is validated before use, retry is bounded to one attempt, and raw upstream errors or user content are not logged.
- **Catalog Safety**: Only HTTPS URLs from verified catalog entries can render as links. Records marked `sample_mock` are clearly labeled; their links, documents, steps, rules, and eligibility outputs are withheld, and they are excluded in production. Empty verified-catalog searches return a localized no-match answer rather than generated scheme claims.
- **Catalog coverage**: One verified seed record for PMEGP is based on the [JanSamarth scheme page](https://www.jansamarth.in/prime-minister-employment-generation-program-scheme), checked on 2026-10-01. Only the individual age and new-project conditions are modeled; because other criteria (including education/project thresholds and applicant categories) are not fully modeled, passing the known conditions returns `UNKNOWN`, never a positive eligibility result. No document list is claimed. Verify and add the full scheme criteria and more authoritative records before relying on recommendations in production. The four remaining records are demo fixtures marked `sample_mock` and are excluded from production.
- **Session storage requirement**: The existing `MemoryStorageAdapter` is an in-memory/demo adapter. Replace it with a durable, access-controlled store before relying on conversation memory across production restarts or multiple server instances.

## Phase 2 setup notes

- When Gemini is unconfigured or temporarily unavailable, the server uses a localized deterministic fallback that searches only the verified catalog, asks the service's required missing field, and answers catalog information questions only from sourced facts. It does not replace outages with a generic network message or invent documents, amounts, or benefits.
- The conversation controller asks only service-required questions; PMEGP can ask whether the project is new or already operating. A request about official documents or application steps can show grounded catalog guidance without collecting unrelated demographics. Unknown eligibility explicitly directs the user to the official source.
- Browser SpeechRecognition and SpeechSynthesis remain the voice provider. Recognition stays continuous, shows interim text as a preview, and submits the accumulated utterance only when recognition ends or the user taps the microphone to stop. Playback selects a matching browser voice where available and surfaces errors. Gemini Live audio is not required for the shared text/voice conversation path.
- `GEMINI_MODEL` can override the default `gemini-flash-latest` model when a different compatible Gemini model is selected.

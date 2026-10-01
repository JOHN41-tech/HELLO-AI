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

## 🚀 Key Features in Phase 1 & 1.5 Architecture

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
10. **AI Service Provider Abstraction**: `AIService` interface decoupling frontend components from model implementation (`MockAIService` in Phase 1/1.5, `GeminiAIService` in Phase 2).
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
# Clone or navigate to project directory
cd "HELLO AI"

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build Verification

```bash
# Run unit & regression test suites (Vitest — 6 suites, 254+ tests)
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
- **`eligibility.test.ts`**: Deterministic rule evaluation across operators (`equals`, `greater_than_or_equal`, `in`, `boolean_true`).
- **`validation.test.ts`**: Zod validation schemas for chat payloads, guided answers, and user demographics.
- **`services.test.ts`**: Category filtering, keyword search, and scheme retrieval.

---

## 🔑 Environment Variables (`.env.local`)

```env
# Server-side Gemini API Key (Consumed in Phase 2)
GEMINI_API_KEY=mock_key_phase1

# Environment settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

---

## 🔮 Phase 2 Gemini Integration Roadmap

Phase 1 establishes a clean, decoupled architecture. Integrating Gemini in Phase 2 requires **zero changes** to frontend components:

1. **`lib/ai/gemini-ai-service.stub.ts`**: Implement full Gemini 2.0 Flash / Pro API calls using `@google/genai` or standard fetch.
2. **Structured JSON Output**: Use Gemini's JSON schema mode (`responseSchema`) to enforce returns matching `AIServiceResponse`, `AIIntent`, and `GuidedQuestion`.
3. **Multilingual System Prompt**: Pass user language (`en`, `ta`, `hi`) to Gemini system prompts to ensure responses match regional dialect standards.
4. **Gemini Live Audio**: Swap browser `SpeechRecognition` with Gemini real-time audio streams via WebSocket.

---

## 🛡️ Security & Privacy Standards

- **Zero Sensitive Data Collection**: No passwords, PINs, OTPs, or bank account credentials are requested or stored.
- **Local Storage / Session Control**: Users can wipe all saved session demographics with a single click in the **My Progress** screen.
- **Server-Side Key Isolation**: `GEMINI_API_KEY` is strictly confined to server-side route handlers (`/api/chat`) and never leaked to client bundles.

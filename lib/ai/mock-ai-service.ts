import { AIService, AIIntent, AIServiceResponse } from '@/types/ai';
import { LanguageCode } from '@/types/language';
import { GuidedQuestion, ConversationHistoryEntry } from '@/types/conversation';
import { GovernmentService, ServiceCategory } from '@/types/service';
import { UserProfileSession, EligibilityResult } from '@/types/session';
import { translateKey, translateLocalizedText } from '@/lib/i18n/localization';
import { serviceRepository } from '@/lib/services/service-repository';

const categoryByIntent: Record<string, ServiceCategory | undefined> = {
  business: 'business', education: 'education', employment: 'employment', skill: 'skill',
  health: 'health', identity: 'assistance', assistance: 'assistance', housing: 'assistance',
};

type OfficialInfoKind = 'documents' | 'steps' | 'amount' | 'overview';

function officialInfoKind(query: string): OfficialInfoKind | undefined {
  const q = query.toLowerCase();
  if (/\b(document|documents|paperwork|papers|proof)\b|ஆவண|சான்று|दस्तावेज|कागज़|పత్ర|ದಾಖಲೆ|രേഖ|कागदपत्र|દસ્તાવેજ|নথি|ਦਸਤਾਵੇਜ਼|ଦଲିଲ|دستاویز/.test(q)) return 'documents';
  if (/\b(apply|application|how to|steps?|process|procedure)\b|விண்ணப்ப|விண்ணப்பிக்க|आवेदन|అప్లికేషన్|దరఖాస్తు|ಅರ್ಜಿ|ಅರ್ಜಿಸು|അപേക്ഷ|अर्ज|અરજી|আবেদন|درخواست|ଆବେଦନ/.test(q)) return 'steps';
  if (/\b(how much|amount|cost|subsidy|maximum|limit|rate)\b|எவ்வளவு|कितना|ఎంత|ಎಷ್ಟು|किती|કેટલું|কত|ਕਿੰਨਾ|কিমান|କେତେ|کتنا/.test(q)) return 'amount';
  if (/\b(what is|tell me about|details|information|overview|benefits)\b|என்ன திட்டம்|क्या है|ఏమిటి|ಏನು|എന്താണ്|काय आहे|શું છે|কি|ਕੀ ਹੈ|কি হয়|କ’ଣ/.test(q)) return 'overview';
  return undefined;
}

function answerFromVerifiedRecord(service: GovernmentService, kind: OfficialInfoKind, language: LanguageCode): string {
  if (kind === 'documents') {
    if (service.requiredDocuments.length === 0) return translateKey(language, 'assistant.noVerifiedDocuments');
    const items = service.requiredDocuments.map((document) => translateLocalizedText(language, document.name));
    return `${translateKey(language, 'service.requiredDocuments')}: ${items.join(', ')}.`;
  }
  if (kind === 'steps') {
    if (service.applicationSteps.length === 0) return translateKey(language, 'assistant.noVerifiedDetails');
    return service.applicationSteps.map((step) =>
      `${translateKey(language, 'guidance.title')} ${step.stepNumber}: ${translateLocalizedText(language, step.title)}. ${translateLocalizedText(language, step.description)}`
    ).join('\n');
  }
  if (kind === 'amount') return translateKey(language, 'assistant.noVerifiedDetails');
  return translateLocalizedText(language, service.description);
}

export class MockAIService implements AIService {
  public async understandIntent(query: string, language: LanguageCode): Promise<AIIntent> {
    const q = query.toLowerCase();
    const has = (...terms: string[]) => terms.some((term) => q.includes(term));
    let category = 'general';

    if (has('scholarship', 'student', 'school', 'college', 'university', 'education', 'tuition', 'கல்வி', 'மாணவர்', 'शिक्षा', 'छात्रवृत्ति', 'విద్య', 'విద్యార్థి', 'ಶಿಕ್ಷಣ', 'വിദ്യാഭ്യാസം', 'शिष्यवृत्ती', 'શિક્ષણ', 'শিক্ষা', 'ਸਿੱਖਿਆ', 'শিক্ষা', 'ଶିକ୍ଷା', 'تعلیم')) {
      category = 'education';
    } else if (has('employment', 'unemployed', 'job', 'work opportunity', 'வேலை', 'வேலையின்மை', 'नौकरी', 'रोजगार', 'ఉద్యోగం', 'ಉದ್ಯೋಗ', 'തൊഴിൽ', 'नोकरी', 'નોકરી', 'চাকরি', 'ਰੁਜ਼ਗਾਰ', 'চাকৰি', 'ଚାକିରି', 'روزگار')) {
      category = 'employment';
    } else if (has('training', 'vocational', 'skill', 'skills', 'course', 'certificate', 'திறன்', 'பயிற்சி', 'कौशल', 'प्रशिक्षण', 'నైపుణ్య', 'శిక్షణ', 'ಕೌಶಲ್ಯ', 'ತರಬೇತಿ', 'നൈപുണ്യ', 'പരിശീലനം', 'कौशल्य', 'प्रशिक्षण', 'કૌશલ્ય', 'તાલીમ', 'দক্ষতা', 'প্রশিক্ষণ', 'ਹੁਨਰ', 'ਸਿਖਲਾਈ', 'দক্ষতা', 'প্ৰশিক্ষণ', 'ଦକ୍ଷତା', 'ପ୍ରଶିକ୍ଷଣ', 'مہارت', 'تربیت')) {
      category = 'skill';
    } else if (has('health', 'hospital', 'medical', 'medicine', 'treatment', 'மருத்துவ', 'ஆரோக்கியம்', 'स्वास्थ्य', 'अस्पताल', 'వైద్య', 'ఆరోగ్యం', 'ಆರೋಗ್ಯ', 'ಆಸ್ಪತ್ರೆ', 'ആരോഗ്യം', 'ആശുപത്രി', 'आरोग्य', 'દવાખાનું', 'স্বাস্থ্য', 'হাসপাতাল', 'ਸਿਹਤ', 'চিকিৎসা', 'স্বাস্থ্য', 'চিকিৎসা', 'ସ୍ୱାସ୍ଥ୍ୟ', 'صحت')) {
      category = 'health';
    } else if (has('aadhaar', 'aadhar', 'ration card', 'voter id', 'pan card', 'identity document', 'ஆதார்', 'அடையாள அட்டை', 'आधार', 'राशन कार्ड', 'पहचान पत्र', 'ఆధార్', 'గుర్తింపు', 'ಆಧಾರ್', 'ಗುರುತಿನ ಚೀಟಿ', 'ആധാർ', 'തിരിച്ചറിയൽ', 'आधार', 'ઓળખપત્ર', 'আধার', 'পরিচয়পত্র', 'ਆਧਾਰ', 'ਪਛਾਣ ਪੱਤਰ', 'পৰিচয়', 'ଆଧାର', 'شناختی')) {
      category = 'identity';
    } else if (has('housing', 'house', 'home', 'rent', 'வீடு', 'வீட்டுவசதி', 'आवास', 'घर', 'ఇల్లు', 'గృహ', 'ಮನೆ', 'ವಸತಿ', 'വീട്', 'ഭവനം', 'घरकुल', 'મકાન', 'বাসস্থান', 'ਘਰ', 'বাসগৃহ', 'ଘର', 'رہائش')) {
      category = 'housing';
    } else if (has('pension', 'social security', 'disability', 'widow', 'senior citizen', 'ஓய்வூதியம்', 'முதியோர்', 'पेंशन', 'विकलांग', 'వృద్ధాప్య', 'పెన్షన్', 'ಪಿಂಚಣಿ', 'വാർദ്ധക്യ', 'पेन्शन', 'વિધવા', 'পেনশন', 'বিধবা', 'ਪੈਨਸ਼ਨ', 'বিধবা', 'ଭତ୍ତା', 'پنشن')) {
      category = 'assistance';
    } else if (has('business', 'loan', 'grant', 'startup', 'start-up', 'enterprise', 'self-employ', 'micro-enterprise', 'pmegp', 'tailor', 'tailoring', 'sewing business', 'small shop', 'தொழில்', 'வணிகம்', 'கடன்', 'சுயதொழில்', 'வியாபாரம்', 'व्यवसाय', 'उद्यम', 'व्यापार', 'कर्ज', 'రుణం', 'వ్యాపారం', 'వాణిజ్యం', 'ಸಾಲ', 'ವ್ಯಾಪಾರ', 'സംരംഭം', 'ബിസിനസ്', 'कर्ज', 'धंदा', 'व्यवसाय', 'ધંધો', 'વ્યવસાય', 'ঋণ', 'ব্যবসা', 'ਕਾਰੋਬਾਰ', 'ਕਰਜ਼ਾ', 'ব্যৱসায়', 'ବ୍ୟବସାୟ', 'کاروبار', 'قرض')) {
      category = 'business';
    }

    const summary = query.trim().slice(0, 240);

    const extractedFields: Record<string, string | number | boolean> = {};
    const ageMatch = q.match(/\b(?:i am|i'm|age|aged|my age is)\s*(\d{1,3})\b/)
      ?? q.match(/\b(\d{1,3})\s*(?:years? old|yrs? old|years? of age)\b/)
      ?? (q.trim().match(/^\d{1,3}$/) ? q.trim().match(/^\d{1,3}$/) : null);
    if (ageMatch && Number(ageMatch[1]) >= 0 && Number(ageMatch[1]) <= 120) {
      extractedFields.age = Number(ageMatch[1]);
    }

    if (q.includes('tamil nadu') || q.includes('தமிழ்நாடு')) {
      extractedFields['state'] = 'Tamil Nadu';
    }

    if (category === 'business') {
      if (has('already operating', 'already running', 'existing business', 'currently running', 'ஏற்கனவே இயங்க', 'ஏற்கனவே செயல்பட', 'पहले से चल', 'पहले से संचालित', 'ఇప్పటికే నడుస్తు', 'ಈಗಾಗಲೇ ನಡೆಯು', 'ഇതിനകം പ്രവർത്തി', 'आधीपासून सुरू', 'પહેલેથી ચાલ', 'ইতিমধ্যে চলছে', 'ਪਹਿਲਾਂ ਹੀ ਚੱਲ', 'ইতিমধ্যে চলি', 'ପୂର୍ବରୁ ଚାଲୁ', 'پہلے سے چل')) {
        extractedFields.businessStatus = 'existing';
      } else if (has('new project', 'new business', 'start a business', 'starting a business', 'start my business', 'new enterprise', 'புதிய திட்ட', 'புதிய தொழில்', 'புதிய வணிக', 'नया प्रोजेक्ट', 'नया व्यवसाय', 'नया कारोबार', 'కొత్త ప్రాజెక్ట్', 'కొత్త వ్యాపారం', 'ಹೊಸ ಯೋಜನೆ', 'ಹೊಸ ವ್ಯವಹಾರ', 'പുതിയ സംരംഭം', 'പുതിയ ബിസിനസ്', 'नवीन प्रकल्प', 'નવો પ્રોજેક્ટ', 'નવો વ્યવસાય', 'নতুন প্রকল্প', 'নতুন ব্যবসা', 'ਨਵਾਂ ਪ੍ਰੋਜੈਕਟ', 'ਨਵਾਂ ਕਾਰੋਬਾਰ', 'নতুন প্ৰকল্প', 'নতুন ব্যৱসায়', 'ନୂତନ ପ୍ରକଳ୍ପ', 'نیا منصوبہ', 'نیا کاروبار')) {
        extractedFields.businessStatus = 'new';
      }
    }

    return {
      category,
      userNeedSummary: summary,
      confidence: 0.92,
      extractedFields,
    };
  }

  public async generateQuestion(
    session: UserProfileSession,
    language: LanguageCode,
    requiredFields?: string[]
  ): Promise<GuidedQuestion | null> {
    const { demographics, answers } = session;
    const userAnswers: Record<string, unknown> = { ...demographics, ...answers };

    if (requiredFields) {
      const missingField = requiredFields.find((field) => {
        const value = userAnswers[field];
        return value === undefined || value === null || value === '' || value === 'prefer_not_to_say';
      });
      if (missingField === 'businessStatus') {
        return {
          id: 'q-business-status',
          fieldKey: 'businessStatus',
          prompt: { [language]: translateKey(language, 'assistant.askBusinessStatus') },
          inputType: 'single_select',
          options: [
            { label: { [language]: translateKey(language, 'assistant.projectNew') }, value: 'new' },
            { label: { [language]: translateKey(language, 'assistant.projectExisting') }, value: 'existing' },
            { label: { [language]: translateKey(language, 'assistant.preferNotToSay') }, value: 'prefer_not_to_say' },
          ],
          required: true,
        };
      }
      if (missingField && !['age', 'state', 'gender'].includes(missingField)) return null;
      if (!missingField) return null;
    }

    if (userAnswers['age'] === undefined) {
      return {
        id: 'q-age',
        fieldKey: 'age',
        prompt: {
          en: 'To check your eligibility for government schemes, what is your age?',
          ta: 'அரசு திட்டங்களுக்கான உங்கள் தகுதியை சரிபார்க்க, உங்கள் வயது என்ன?',
          hi: 'सरकारी योजनाओं के लिए आपकी पात्रता जांचने के लिए आपकी उम्र क्या है?',
          te: 'ప్రభుత్వ పథకాలకు మీ అర్హతను తనిఖీ చేయడానికి, మీ వయస్సు ఎంత?',
          kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು, ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?',
          ml: 'സർക്കാർ പദ്ധതികൾക്കുള്ള നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കാൻ, നിങ്ങളുടെ വയസ്സ് എത്രയാണ്?',
          mr: 'सरकारी योजनांसाठी तुमची पात्रता तपासण्यासाठी, तुमचे वय काय आहे?',
          gu: 'સરકારી યોજનાઓ માટે તમારી પાત્રતા ચકાસવા માટે, તમારી ઉંમર કેટલી છે?',
          bn: 'সরকারি প্রকল্পের জন্য আপনার যোগ্যতা পরীক্ষা করতে, আপনার বয়স কত?',
          pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲਈ ਤੁਹਾਡੀ ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ, ਤੁਹਾਡੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?',
          as: 'চৰকাৰী আঁচনিৰ বাবে আপোনাৰ যোগ্যতা পৰীক্ষা কৰিবলৈ, আপোনাৰ বয়স কিমান?',
          or: 'ସରକାରୀ ଯୋଜନା ପାଇଁ ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରିବାକୁ, ଆପଣଙ୍କ ବୟସ କେତେ?',
          ur: 'سرکاری اسکیموں کے لیے آپ کی اہلیت چیک کرنے کے لیے، آپ کی عمر کیا ہے؟',
        },
        helpText: {
          en: 'You can type a number or speak your age.',
          ta: 'நீங்கள் எண்ணைத் தட்டச்சு செய்யலாம் அல்லது உங்கள் வயதைக் கூறலாம்.',
          hi: 'आप संख्या टाइप कर सकती हैं या अपनी उम्र बोल सकती हैं।',
          ur: 'آپ نمبر ٹائپ کر سکتے ہیں یا اپنی عمر بول سکتے ہیں۔',
        },
        inputType: 'number',
        required: true,
      };
    }

    if (!userAnswers['state']) {
      return {
        id: 'q-state',
        fieldKey: 'state',
        prompt: {
          en: 'Which state do you permanently live in?',
          ta: 'நீங்கள் நிரந்தரமாக எந்த மாநிலத்தில் வசிக்கிறீர்கள்?',
          hi: 'आप किस राज्य में रहते हैं?',
          te: 'మీరు ఏ రాష్ట్రంలో శాశ్వతంగా నివసిస్తున్నారు?',
          kn: 'ನೀವು ಯಾವ ರಾಜ್ಯದಲ್ಲಿ ಕಾಯಂ ಆಗಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?',
          ml: 'നിങ്ങൾ ഏത് സംസ്ഥാനത്താണ് സ്ഥിരമായി താമസിക്കുന്നത്?',
          mr: 'तुम्ही कोणत्या राज्यात कायमचे राहता?',
          gu: 'તમે કયા રાજ્યમાં કાયમી રહો છો?',
          bn: 'আপনি কোন রাজ্যে স্থায়ীভাবে বাস করেন?',
          pa: 'ਤੁਸੀਂ ਕਿਸ ਰਾਜ ਵਿੱਚ ਪੱਕੇ ਤੌਰ ਤੇ ਰਹਿੰਦੇ ਹੋ?',
          as: 'আপুনি কোনখন ৰাজ্যত স্থায়ীভাৱে বাস কৰে?',
          or: 'ଆପଣ କେଉଁ ରାଜ୍ୟରେ ସ୍ଥାୟୀ ଭାବରେ ବାସ କରନ୍ତି?',
          ur: 'آپ کس ریاست میں مستقل رہتے ہیں؟',
        },
        inputType: 'single_select',
        options: [
          { label: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு', hi: 'तमिलनाडु' }, value: 'Tamil Nadu' },
          { label: { en: 'Other State in India', ta: 'இந்தியாவின் பிற மாநிலம்', hi: 'भारत का अन्य राज्य' }, value: 'Other' },
        ],
        required: true,
      };
    }

    if (!userAnswers['gender']) {
      return {
        id: 'q-gender',
        fieldKey: 'gender',
        prompt: { [language]: translateKey(language, 'assistant.askGender') },
        inputType: 'single_select',
        options: [
          { label: { [language]: translateKey(language, 'assistant.genderFemale') }, value: 'female' },
          { label: { [language]: translateKey(language, 'assistant.genderMale') }, value: 'male' },
          { label: { [language]: translateKey(language, 'assistant.genderOther') }, value: 'other' },
          { label: { [language]: translateKey(language, 'assistant.preferNotToSay') }, value: 'prefer_not_to_say' },
        ],
        required: true,
      };
    }

    return null;
  }

  public async generateResponse(
    userQuery: string,
    session: UserProfileSession,
    language: LanguageCode,
    _history: ConversationHistoryEntry[]
  ): Promise<AIServiceResponse> {
    const intent = await this.understandIntent(userQuery, language);

    for (const [field, value] of Object.entries(intent.extractedFields)) {
      if (field === 'age' && typeof value === 'number') session.demographics.age = value;
      else if (field === 'state' && typeof value === 'string') session.demographics.state = value;
      else if (field === 'gender' && (value === 'female' || value === 'male' || value === 'other')) session.demographics.gender = value;
      else session.answers[field] = value;
    }

    const hasServiceIntent = !['general', 'other', 'OTHER'].includes(intent.category);

    const infoKind = officialInfoKind(userQuery);
    if (infoKind) {
      let service = session.selectedServiceId
        ? await serviceRepository.getServiceById(session.selectedServiceId)
        : null;
      const category = categoryByIntent[intent.category];
      if (!service && category) {
        const match = await serviceRepository.findBestMatchingService(session, userQuery, category);
        service = match?.service ?? null;
      }
      if (service?.source.verificationStatus === 'verified') {
        const responseText = answerFromVerifiedRecord(service, infoKind, language);
        return {
          message: responseText,
          responseText,
          shouldSpeak: true,
          provider: 'mock',
          serviceId: service.id,
          intent,
          nextAction: 'PROVIDE_GUIDANCE',
        };
      }
    }

    const question = hasServiceIntent ? await this.generateQuestion(session, language) : null;

    if (question) {
      const responseText = translateKey(language, 'assistant.offlineQuestion');
      return {
        message: responseText,
        responseText,
        shouldSpeak: true,
        provider: 'mock',
        question,
        intent,
        nextAction: 'ask_question',
      };
    }

    const responseText = session.selectedServiceId && !hasServiceIntent
      ? translateKey(language, 'assistant.noVerifiedDetails')
      : translateKey(language, 'assistant.offlineHelp');
    return {
      message: responseText,
      responseText,
      shouldSpeak: true,
      provider: 'mock',
      intent,
      nextAction: hasServiceIntent ? 'show_service' : 'general_response',
    };
  }

  public async summarizeUserNeed(session: UserProfileSession, language: LanguageCode): Promise<string> {
    return `User need in ${session.language}: ${session.demographics.state || ''} (Age ${session.demographics.age || ''}).`;
  }

  public async explainEligibility(
    service: GovernmentService,
    result: EligibilityResult,
    language: LanguageCode
  ): Promise<string> {
    const name = translateLocalizedText(language, service.name);
    return result.isEligible
      ? `${translateKey(language, 'eligibility.potentiallyEligible')}: ${name}`
      : `${translateKey(language, 'eligibility.moreInformationRequired')}: ${name}`;
  }

  public async explainDocument(
    documentId: string,
    service: GovernmentService,
    language: LanguageCode
  ): Promise<string> {
    const doc = service.requiredDocuments.find((d) => d.id === documentId);
    if (!doc) return '';
    return translateLocalizedText(language, doc.description);
  }

  public async generateGuidance(
    service: GovernmentService,
    stepIndex: number,
    language: LanguageCode
  ): Promise<string> {
    const step = service.applicationSteps[stepIndex];
    if (!step) return '';
    const title = translateLocalizedText(language, step.title);
    return `${translateKey(language, 'guidance.title')} Step ${step.stepNumber}: ${title}`;
  }
}

export const aiService = new MockAIService();

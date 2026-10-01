import { AIService, AIIntent, AIServiceResponse } from '@/types/ai';
import { LanguageCode } from '@/types/language';
import { GuidedQuestion, ChatMessage } from '@/types/conversation';
import { GovernmentService } from '@/types/service';
import { UserProfileSession, EligibilityResult } from '@/types/session';
import { serviceRepository } from '@/lib/services/service-repository';
import { translateKey, translateLocalizedText } from '@/lib/i18n/localization';
import { detectLanguageFromQuery } from '@/lib/i18n/languageDetection';

export class MockAIService implements AIService {
  public async understandIntent(query: string, language: LanguageCode): Promise<AIIntent> {
    const q = query.toLowerCase();
    const activeLang = detectLanguageFromQuery(query, language);

    let category = 'general';
    let summary = query;

    if (
      q.includes('business') ||
      q.includes('தொழில்') ||
      q.includes('व्यापार') ||
      q.includes('વ્યાપાર') ||
      q.includes('ব্যবসা') ||
      q.includes('ਕਾਰੋਬਾਰ') ||
      q.includes('ব্যৱসায়') ||
      q.includes('ବ୍ୟବସାୟ') ||
      q.includes('تجارت') ||
      q.includes('grant') ||
      q.includes('loan')
    ) {
      category = 'business';
      summary = translateKey(activeLang, 'actions.categoryBusiness');
    } else if (
      q.includes('education') ||
      q.includes('school') ||
      q.includes('college') ||
      q.includes('கல்வி') ||
      q.includes('शिक्षा') ||
      q.includes('ਚੰਗੀ ਸਿੱਖਿਆ') ||
      q.includes('শিক্ষা')
    ) {
      category = 'education';
      summary = translateKey(activeLang, 'actions.categoryEducation');
    } else if (
      q.includes('sewing') ||
      q.includes('tailor') ||
      q.includes('தையல்') ||
      q.includes('सिलाई') ||
      q.includes('કૌશલ્ય')
    ) {
      category = 'skill';
      summary = translateKey(activeLang, 'actions.categorySkill');
    }

    const extractedFields: Record<string, string | number | boolean> = {};
    const ageMatch = q.match(/(\d{2})/);
    if (ageMatch && parseInt(ageMatch[1]) >= 15 && parseInt(ageMatch[1]) <= 80) {
      extractedFields['age'] = parseInt(ageMatch[1]);
    }

    if (q.includes('tamil nadu') || q.includes('தமிழ்நாடு')) {
      extractedFields['state'] = 'Tamil Nadu';
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
    language: LanguageCode
  ): Promise<GuidedQuestion | null> {
    const { demographics, answers } = session;
    const userAnswers = { ...demographics, ...answers };

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

    return null;
  }

  public async generateResponse(
    userQuery: string,
    session: UserProfileSession,
    language: LanguageCode,
    _history: ChatMessage[]
  ): Promise<AIServiceResponse> {
    const intent = await this.understandIntent(userQuery, language);

    if (Object.keys(intent.extractedFields).length > 0) {
      session.demographics = {
        ...session.demographics,
        ...intent.extractedFields,
      };
    }

    const question = await this.generateQuestion(session, language);
    const match = await serviceRepository.findBestMatchingService(session, userQuery);

    if (question) {
      return {
        message: translateKey(language, 'welcome.subtitle'),
        question,
        intent,
        nextAction: 'ask_question',
      };
    }

    if (match) {
      const service = match.service;
      const result = match.result;
      const serviceName = translateLocalizedText(language, service.name);

      return {
        message: `${translateKey(language, 'eligibility.potentiallyEligible')}: **${serviceName}**`,
        suggestedService: service,
        eligibilityResult: result,
        intent,
        nextAction: 'show_service',
      };
    }

    return {
      message: translateKey(language, 'welcome.subtitle'),
      nextAction: 'show_service',
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

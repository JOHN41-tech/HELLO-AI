import { GovernmentService } from '@/types/service';

export const SAMPLE_GOVERNMENT_SERVICES: GovernmentService[] = [
  {
    id: 'tn-women-startup-grant',
    name: {
      en: 'Tamil Nadu Women Entrepreneurship & Startup Grant',
      ta: 'தமிழ்நாடு பெண்கள் தொழில்முனைவோர் மற்றும் ஸ்டார்ட்அப் நிதி உதவி',
      hi: 'तमिलनाडु महिला उद्यमिता और स्टार्टअप अनुदान',
    },
    category: 'business',
    description: {
      en: 'Financial assistance and seed grant of up to ₹5,00,000 for women looking to start or expand micro-enterprises and small businesses in Tamil Nadu.',
      ta: 'தமிழ்நாட்டில் சிறு தொழில் அல்லது புதிதாக தொழில் தொடங்க விரும்பும் பெண்களுக்கு ரூ.5,00,000 வரை நிதி உதவி மற்றும் முதற்கட்ட நிதி.',
      hi: 'तमिलनाडु में सूक्ष्म उद्यम शुरू करने या विस्तार करने की इच्छुक महिलाओं के लिए ₹5,00,000 तक की वित्तीय सहायता।',
    },
    targetUsers: {
      en: 'Women entrepreneurs aged 18 to 55 residing in Tamil Nadu.',
      ta: 'தமிழ்நாட்டில் வசிக்கும் 18 முதல் 55 வயதுடைய பெண் தொழில்முனைவோர்.',
      hi: 'तमिलनाडु में रहने वाली 18 से 55 वर्ष की महिला उद्यमी।',
    },
    languages: ['en', 'ta', 'hi'],
    eligibilityRules: [
      {
        id: 'rule-gender',
        field: 'gender',
        operator: 'equals',
        value: 'female',
        explanation: {
          en: 'Applicant must be a woman.',
          ta: 'விண்ணப்பதாரர் பெண்ணாக இருக்க வேண்டும்.',
          hi: 'आवेदक महिला होनी चाहिए।',
        },
      },
      {
        id: 'rule-min-age',
        field: 'age',
        operator: 'greater_than_or_equal',
        value: 18,
        explanation: {
          en: 'Applicant must be at least 18 years old.',
          ta: 'விண்ணப்பதாரருக்கு குறைந்தபட்சம் 18 வயது இருக்க வேண்டும்.',
          hi: 'आवेदक की आयु कम से कम 18 वर्ष होनी चाहिए।',
        },
      },
      {
        id: 'rule-max-age',
        field: 'age',
        operator: 'less_than_or_equal',
        value: 55,
        explanation: {
          en: 'Applicant age should not exceed 55 years.',
          ta: 'விண்ணப்பதாரரின் வயது 55 வயதிற்கு மிகாமல் இருக்க வேண்டும்.',
          hi: 'आवेदक की आयु 55 वर्ष से अधिक नहीं होनी चाहिए।',
        },
      },
      {
        id: 'rule-state',
        field: 'state',
        operator: 'equals',
        value: 'Tamil Nadu',
        explanation: {
          en: 'Must be a resident of Tamil Nadu.',
          ta: 'தமிழ்நாட்டில் நிரந்தரமாக வசிப்பவராக இருக்க வேண்டும்.',
          hi: 'तमिलनाडु का निवासी होना चाहिए।',
        },
      },
    ],
    requiredDocuments: [
      {
        id: 'doc-aadhaar',
        name: {
          en: 'Aadhaar Card',
          ta: 'ஆதார் கார்டு',
          hi: 'आधार कार्ड',
        },
        description: {
          en: 'For identity and address verification.',
          ta: 'அடையாளம் மற்றும் முகவரி சான்றாக.',
          hi: 'पहचान और पते के प्रमाण के लिए।',
        },
        required: true,
      },
      {
        id: 'doc-bank-passbook',
        name: {
          en: 'Bank Account Passbook / Cancelled Cheque',
          ta: 'வங்கி கணக்கு புத்தகத்தின் முதல் பக்கம் / காசோலை',
          hi: 'बैंक पासबुक / रद्द किया गया चेक',
        },
        description: {
          en: 'Account details where grant amount will be credited.',
          ta: 'நிதி உதவித் தொகை செலுத்தப்படும் வங்கி கணக்கு விவரங்கள்.',
          hi: 'खाता विवरण जहां अनुदान राशि जमा की जाएगी।',
        },
        required: true,
      },
      {
        id: 'doc-project-summary',
        name: {
          en: 'Simple Business Plan / Project Description',
          ta: 'எளிய தொழில் திட்டம் / திட்ட விளக்கம்',
          hi: 'सरल व्यवसाय योजना / परियोजना विवरण',
        },
        description: {
          en: 'Short write-up or audio description of the proposed business idea.',
          ta: 'நீங்கள் செய்ய விரும்பும் தொழிலைப் பற்றிய எளிய விளக்கம்.',
          hi: 'प्रस्तावित व्यावसायिक विचार का संक्षिप्त विवरण।',
        },
        required: true,
      },
      {
        id: 'doc-ration-card',
        name: {
          en: 'Smart Ration Card / Community Certificate',
          ta: 'குடும்ப அட்டை (ஸ்மார்ட் ரேஷன் கார்டு) / சாதிச் சான்றிதழ்',
          hi: 'स्मार्ट राशन कार्ड / समुदाय प्रमाणपत्र',
        },
        description: {
          en: 'Proof of residency in Tamil Nadu.',
          ta: 'தமிழ்நாட்டில் வசிப்பதற்கான சான்று.',
          hi: 'तमिलनाडु में निवास का प्रमाण।',
        },
        required: false,
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: {
          en: 'Gather Identification & Bank Documents',
          ta: 'ஆதார் கார்டு மற்றும் வங்கி கணக்கு விவரங்களை ஆயத்தம் செய்க',
          hi: 'पहचान और बैंक दस्तावेज एकत्र करें',
        },
        description: {
          en: 'Ensure your Aadhaar card and bank account are linked with active mobile number.',
          ta: 'உங்கள் ஆதார் கார்டு மற்றும் வங்கி கணக்கில் உங்கள் மொபைல் எண் இணைக்கப்பட்டுள்ளதா என்பதை உறுதிப்படுத்தவும்.',
          hi: 'सुनिश्चित करें कि आपका आधार और बैंक खाता मोबाइल नंबर से जुड़ा हुआ है।',
        },
        userAction: {
          en: 'Keep Aadhaar and Bank Passbook ready.',
          ta: 'ஆதார் மற்றும் வங்கி புத்தகத்தை அருகில் வைத்திருக்கவும்.',
          hi: 'आधार और बैंक पासबुक तैयार रखें।',
        },
        helpText: {
          en: 'HELLO AI can help verify if your documents meet requirements.',
          ta: 'உங்கள் ஆவணங்கள் சரியானவையா என்பதை சரிபார்க்க HELLO AI உதவும்.',
          hi: 'HELLO AI आपके दस्तावेजों की जांच में मदद कर सकता है।',
        },
      },
      {
        stepNumber: 2,
        title: {
          en: 'Submit Project Application via e-Sevai / Portal',
          ta: 'இ-சேவை மையம் அல்லது இணையதளம் மூலம் விண்ணப்பிக்கவும்',
          hi: 'ई-सेवा केंद्र या पोर्टल के माध्यम से आवेदन करें',
        },
        description: {
          en: 'Submit your application at nearest e-Sevai Center (இ-சேவை மையம்) or directly on the Tamil Nadu Single Window Portal.',
          ta: 'அருகிலுள்ள இ-சேவை மையத்திலோ அல்லது தமிழ்நாடு ஒற்றைச் சாளர இணையதளத்திலோ விண்ணப்பத்தைச் சமர்ப்பிக்கவும்.',
          hi: 'निकटतम ई-सेवा केंद्र पर या सीधे सिंगल विंडो पोर्टल पर आवेदन जमा करें।',
        },
        userAction: {
          en: 'Visit nearest e-Sevai center or apply online.',
          ta: 'அருகிலுள்ள இ-சேவை மையத்திற்குச் செல்லவும் அல்லது ஆன்லைனில் விண்ணப்பிக்கவும்.',
          hi: 'निकटतम ई-सेवा केंद्र पर जाएं या ऑनलाइन आवेदन करें।',
        },
        officialPageUrl: 'https://www.tn.gov.in/service',
      },
      {
        stepNumber: 3,
        title: {
          en: 'District Industries Centre (DIC) Verification',
          ta: 'மாவட்ட தொழில் மைய அதிகாரி சரிபார்ப்பு',
          hi: 'जिला उद्योग केंद्र (DIC) सत्यापन',
        },
        description: {
          en: 'A field officer will contact you to review your business location or business plan.',
          ta: 'மாவட்ட தொழில் மைய அதிகாரி உங்கள் தொழில் திட்டத்தை சரிபார்க்க உங்களைத் தொடர்பு கொள்வார்.',
          hi: 'एक अधिकारी आपकी व्यावसायिक योजना की समीक्षा के लिए आपसे संपर्क करेगा।',
        },
        userAction: {
          en: 'Answer officer calls and present basic project outline.',
          ta: 'அதிகாரியின் அழைப்பிற்கு பதிலளித்து தொழில் விவரங்களை கூறவும்.',
          hi: 'अधिकारी के फोन का उत्तर दें और व्यवसाय रेखांकित करें।',
        },
      },
      {
        stepNumber: 4,
        title: {
          en: 'Direct Benefit Transfer (DBT) Disbursement',
          ta: 'நேரடி மானியம் வங்கி கணக்கில் জমা ஆதல்',
          hi: 'प्रत्यक्ष लाभ अंतरण (DBT) संवितरण',
        },
        description: {
          en: 'Approved grant funds will be transferred directly to your bank account via DBT.',
          ta: 'அங்கீகரிக்கப்பட்ட மானியத் தொகை உங்கள் வங்கி கணக்கில் நேரடியாக செலுத்தப்படும்.',
          hi: 'स्वीकृत अनुदान राशि डीबीटी के माध्यम से आपके बैंक खाते में स्थानांतरित की जाएगी।',
        },
        userAction: {
          en: 'Check bank account SMS notification for credit confirmation.',
          ta: 'வங்கி கணக்கில் பணம் வந்ததற்கான எஸ்.எம்.எஸ் செய்தியைச் சரிபார்க்கவும்.',
          hi: 'क्रेडिट पुष्टि के लिए बैंक खाते का एसएमएस जांचें।',
        },
      },
    ],
    officialUrl: 'https://www.tn.gov.in',
    source: {
      authorityName: 'Department of Micro, Small and Medium Enterprises, Govt of Tamil Nadu',
      officialUrl: 'https://www.tn.gov.in',
      lastVerifiedAt: '2026-09-15',
      verificationStatus: 'sample_mock',
    },
    tags: ['business', 'grant', 'women', 'entrepreneurship', 'tamil nadu'],
  },
  {
    id: 'pm-mudra-yojana-women',
    name: {
      en: 'PM Mudra Yojana (Mahila Mudra Loan Scheme)',
      ta: 'பிரதமர் முத்ரா திட்டம் (மகளிர் கடன் திட்டம்)',
      hi: 'प्रधानमंत्री मुद्रा योजना (महिला मुद्रा ऋण योजना)',
    },
    category: 'business',
    description: {
      en: 'Collateral-free loans up to ₹50,000 (Shishu) to ₹5,00,000 (Kishor) for women starting small businesses like tailoring, handicraft, food stalls, or retail shops.',
      ta: 'தையல், கைவினை, உணவுப் பொருட்கள் அல்லது சில்லறை வியாபாரம் செய்யும் பெண்களுக்கு பிணையில்லா வங்கி கடன் ரூ.50,000 முதல் ரூ.5,00,000 வரை வழங்கப்படுகிறது.',
      hi: 'सिलाई, हस्तशिल्प, भोजन स्टॉल या खुदरा दुकानें शुरू करने वाली महिलाओं के लिए ₹50,000 से ₹5,00,000 तक का बिना गारंटी का ऋण।',
    },
    targetUsers: {
      en: 'Indian citizens aged 18+ who want to run a small micro-enterprise.',
      ta: 'சிறு தொழில் செய்ய விரும்பும் 18 வயது நிரம்பிய இந்திய குடிமக்கள்.',
      hi: '18 वर्ष से अधिक आयु की भारतीय महिला नागरिक।',
    },
    languages: ['en', 'ta', 'hi'],
    eligibilityRules: [
      {
        id: 'rule-min-age',
        field: 'age',
        operator: 'greater_than_or_equal',
        value: 18,
        explanation: {
          en: 'Minimum age of applicant must be 18 years.',
          ta: 'குறைந்தபட்ச வயது 18 ஆக இருக்க வேண்டும்.',
          hi: 'आवेदक की न्यूनतम आयु 18 वर्ष होनी चाहिए।',
        },
      },
    ],
    requiredDocuments: [
      {
        id: 'doc-aadhaar',
        name: {
          en: 'Aadhaar Card / Voter ID',
          ta: 'ஆதார் கார்டு / வாக்காளர் அடையாள அட்டை',
          hi: 'आधार कार्ड / मतदाता पहचान पत्र',
        },
        description: {
          en: 'Identity proof.',
          ta: 'அடையாள சான்று.',
          hi: 'पहचान प्रमाण।',
        },
        required: true,
      },
      {
        id: 'doc-bank-statement',
        name: {
          en: '6-Month Bank Account Statement',
          ta: '6 மாத வங்கி கணக்கு விவரம்',
          hi: '6 महीने का बैंक स्टेटमेंट',
        },
        description: {
          en: 'Showing income or transaction history if available.',
          ta: 'வங்கி பரிவர்த்தனை விவரங்கள்.',
          hi: 'लेन-देन इतिहास दर्शाने वाला बैंक विवरण।',
        },
        required: true,
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: {
          en: 'Visit Any Public Sector Bank or Jan Samarth Portal',
          ta: 'அரசு வங்கி அல்லது ஜன் சமர்த் இணையதளத்தை அணுகவும்',
          hi: 'किसी सार्वजनिक बैंक या जन समर्थ पोर्टल पर जाएं',
        },
        description: {
          en: 'Visit your nearest bank branch or apply online via Jan Samarth portal.',
          ta: 'உங்களுக்கு அருகிலுள்ள வங்கி கிளைக்குச் செல்லவும் அல்லது ஆன்லைனில் விண்ணப்பிக்கவும்.',
          hi: 'निकटतम बैंक शाखा पर जाएं या जन समर्थ पोर्टल के माध्यम से आवेदन करें।',
        },
        userAction: {
          en: 'Request Mudra Loan Application Form for Women.',
          ta: 'முத்ரா கடன் விண்ணப்பப் படிவத்தைக் கேட்கவும்.',
          hi: 'महिला मुद्रा ऋण आवेदन पत्र का अनुरोध करें।',
        },
        officialPageUrl: 'https://www.mudra.org.in',
      },
    ],
    officialUrl: 'https://www.mudra.org.in',
    source: {
      authorityName: 'Ministry of Finance, Government of India',
      officialUrl: 'https://www.mudra.org.in',
      lastVerifiedAt: '2026-08-20',
      verificationStatus: 'sample_mock',
    },
    tags: ['loan', 'business', 'mudra', 'bank'],
  },
  {
    id: 'tn-free-sewing-machine-scheme',
    name: {
      en: 'Tamil Nadu Free Sewing Machine Scheme',
      ta: 'தமிழ்நாடு இலவச தையல் இயந்திரம் வழங்கும் திட்டம்',
      hi: 'तमिलनाडु मुफ्त सिलाई मशीन योजना',
    },
    category: 'skill',
    description: {
      en: 'Free motorized/manual sewing machines distributed to trained women, widows, and destitute women to boost self-employment at home.',
      ta: 'தையல் கலை அறிந்த பெண்கள், கணவரை இழந்தோர் மற்றும் ஆதரவற்ற பெண்களுக்கு சுயதொழில் தொடங்குவதற்காக இலவச தையல் இயந்திரம் வழங்கப்படுகிறது.',
      hi: 'घर पर स्वरोजगार को बढ़ावा देने के लिए प्रशिक्षित महिलाओं, विधवाओं और निराश्रित महिलाओं को मुफ्त सिलाई मशीनें वितरित की जाती हैं।',
    },
    targetUsers: {
      en: 'Women aged 20-40 trained in tailoring with annual family income under ₹72,000.',
      ta: 'தையல் பயிற்சி பெற்ற 20 முதல் 40 வயதுடைய பெண்கள் (குடும்ப ஆண்டு வருமானம் ₹72,000-க்குள்).',
      hi: 'सिलाई में प्रशिक्षित 20-40 वर्ष की महिलाएं (वार्षिक आय ₹72,000 से कम)।',
    },
    languages: ['en', 'ta', 'hi'],
    eligibilityRules: [
      {
        id: 'rule-gender',
        field: 'gender',
        operator: 'equals',
        value: 'female',
        explanation: {
          en: 'Must be a woman applicant.',
          ta: 'பெண்ணாக இருக்க வேண்டும்.',
          hi: 'महिला आवेदक होनी चाहिए।',
        },
      },
      {
        id: 'rule-min-age',
        field: 'age',
        operator: 'greater_than_or_equal',
        value: 20,
        explanation: {
          en: 'Age must be at least 20 years.',
          ta: 'வயது 20 அல்லது அதற்கு மேல் இருக்க வேண்டும்.',
          hi: 'आयु कम से कम 20 वर्ष होनी चाहिए।',
        },
      },
      {
        id: 'rule-max-age',
        field: 'age',
        operator: 'less_than_or_equal',
        value: 40,
        explanation: {
          en: 'Age must not exceed 40 years.',
          ta: 'வயது 40-க்கு மிகாமல் இருக்க வேண்டும்.',
          hi: 'आयु 40 वर्ष से अधिक नहीं होनी चाहिए।',
        },
      },
      {
        id: 'rule-income',
        field: 'annualIncome',
        operator: 'less_than_or_equal',
        value: 72000,
        explanation: {
          en: 'Annual family income should be ₹72,000 or less.',
          ta: 'குடும்பத்தின் ஆண்டு வருமானம் ரூ.72,000-க்குள் இருக்க வேண்டும்.',
          hi: 'वार्षिक पारिवारिक आय ₹72,000 या उससे कम होनी चाहिए।',
        },
      },
    ],
    requiredDocuments: [
      {
        id: 'doc-tailoring-cert',
        name: {
          en: 'Tailoring Training Certificate',
          ta: 'தையல் பயிற்சி சான்றிதழ்',
          hi: 'सिलाई प्रशिक्षण प्रमाण पत्र',
        },
        description: {
          en: 'Proof that applicant knows tailoring.',
          ta: 'தையல் தொழில் தெரியும் என்பதற்கான சான்றிதழ்.',
          hi: 'सिलाई जानने का प्रमाण।',
        },
        required: true,
      },
      {
        id: 'doc-income-cert',
        name: {
          en: 'Income Certificate from Tahsildar',
          ta: 'வருமானச் சான்றிதழ் (தாசில்தார் வழங்கியது)',
          hi: 'तहसीलदार से आय प्रमाण पत्र',
        },
        description: {
          en: 'Showing family income is within limits.',
          ta: 'வருமான வரம்பை உறுதி செய்யும் சான்றிதழ்.',
          hi: 'आय सीमा का प्रमाण।',
        },
        required: true,
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: {
          en: 'Apply at District Social Welfare Office / e-Sevai Center',
          ta: 'மாவட்ட சமூக நல அலுவலகம் அல்லது இ-சேவை மையத்தில் விண்ணப்பிக்கவும்',
          hi: 'जिला समाज कल्याण कार्यालय में आवेदन करें',
        },
        description: {
          en: 'Obtain free application form from Social Welfare Department or e-Sevai portal.',
          ta: 'சமூக நலத்துறை அலுவலகத்தில் விண்ணப்பப் படிவம் பெறவும்.',
          hi: 'समाज कल्याण विभाग से आवेदन पत्र प्राप्त करें।',
        },
        userAction: {
          en: 'Fill application and attach tailoring certificate.',
          ta: 'விண்ணப்பத்தை பூர்த்தி செய்து தையல் சான்றிதழை இணைக்கவும்.',
          hi: 'आवेदन भरें और सिलाई प्रमाण पत्र संलग्न करें।',
        },
      },
    ],
    officialUrl: 'https://www.tn.gov.in/socialwelfare',
    source: {
      authorityName: 'Social Welfare & Women Empowerment Dept, Govt of Tamil Nadu',
      officialUrl: 'https://www.tn.gov.in/socialwelfare',
      lastVerifiedAt: '2026-09-01',
      verificationStatus: 'sample_mock',
    },
    tags: ['skill', 'sewing', 'women', 'free_equipment'],
  },
  {
    id: 'tn-pudhumai-penn-education',
    name: {
      en: 'Pudhumai Penn Higher Education Assurance Scheme',
      ta: 'புதுமைப் பெண் திட்டம் (உயர் கல்வி உறுதித் திட்டம்)',
      hi: 'पुधुमई पेन उच्च शिक्षा आश्वासन योजना',
    },
    category: 'education',
    description: {
      en: 'Monthly financial assistance of ₹1,000 directly credited to girls pursuing diploma, degree, or ITI courses after studying in Govt Schools.',
      ta: 'அரசுப் பள்ளிகளில் படித்த மாணவிகள் பட்டப் படிப்பு, டிப்ளமோ அல்லது ஐ.டி.ஐ படிக்கும் போது மாதம் ரூ.1,000 நேரடியாக வங்கி கணக்கில் வழங்கப்படும்.',
      hi: 'सरकारी स्कूलों में पढ़ने के बाद डिप्लोमा या डिग्री की पढ़ाई करने वाली छात्राओं को ₹1,000 प्रति माह की सहायता।',
    },
    targetUsers: {
      en: 'Girl students who studied classes 6th to 12th in Tamil Nadu Govt schools.',
      ta: 'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 ஆம் வகுப்பு வரை படித்த பெண் மாணவிகள்.',
      hi: 'तमिलनाडु सरकार के स्कूलों में कक्षा 6 से 12 तक पढ़ने वाली छात्राएं।',
    },
    languages: ['en', 'ta', 'hi'],
    eligibilityRules: [
      {
        id: 'rule-gender',
        field: 'gender',
        operator: 'equals',
        value: 'female',
        explanation: {
          en: 'Must be a female student.',
          ta: 'பெண் மாணவியாக இருக்க வேண்டும்.',
          hi: 'छात्रा होनी चाहिए।',
        },
      },
      {
        id: 'rule-student',
        field: 'isStudent',
        operator: 'boolean_true',
        value: true,
        explanation: {
          en: 'Must be currently enrolled in higher education (degree/diploma/ITI).',
          ta: 'தற்போது கல்லூரி அல்லது டிப்ளமோ படித்துக் கொண்டிருக்க வேண்டும்.',
          hi: 'वर्तमान में उच्च शिक्षा में नामांकित होना चाहिए।',
        },
      },
    ],
    requiredDocuments: [
      {
        id: 'doc-school-tc',
        name: {
          en: 'School Transfer Certificate (Class 6th to 12th Govt School)',
          ta: 'அரசுப் பள்ளி மாற்றுச் சான்றிதழ் (6 முதல் 12 ஆம் வகுப்பு)',
          hi: 'स्कूल ट्रांसफर सर्टिफिकेट',
        },
        description: {
          en: 'Proof of studying in TN Govt School.',
          ta: 'அரசுப் பள்ளியில் படித்ததற்கான சான்று.',
          hi: 'सरकारी स्कूल में पढ़ने का प्रमाण।',
        },
        required: true,
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: {
          en: 'Register on Penkalvi Portal via College Nodal Officer',
          ta: 'கல்லூரி ஒருங்கிணைப்பாளர் மூலம் பெண் கல்வி இணையதளத்தில் பதிவு செய்க',
          hi: 'कॉलेज नोडल अधिकारी के माध्यम से पेनकल्वी पोर्टल पर पंजीकरण करें',
        },
        description: {
          en: 'Your college designated officer will assist in uploading school certificates.',
          ta: 'உங்கள் கல்லூரி அதிகாரி சான்றிதழ்களை பதிவேற்ற உதவுவார்.',
          hi: 'आपका कॉलेज अधिकारी प्रमाण पत्र अपलोड करने में मदद करेगा।',
        },
        userAction: {
          en: 'Contact college office with Aadhaar and Govt School TC.',
          ta: 'ஆதார் மற்றும் பள்ளி சான்றிதழுடன் கல்லூரி அலுவலகத்தை அணுகவும்.',
          hi: 'आधार और स्कूल टीसी के साथ कॉलेज कार्यालय से संपर्क करें।',
        },
        officialPageUrl: 'https://penkalvi.tn.gov.in',
      },
    ],
    officialUrl: 'https://penkalvi.tn.gov.in',
    source: {
      authorityName: 'Higher Education Department, Govt of Tamil Nadu',
      officialUrl: 'https://penkalvi.tn.gov.in',
      lastVerifiedAt: '2026-09-10',
      verificationStatus: 'sample_mock',
    },
    tags: ['education', 'women', 'stipend', 'college'],
  },
];

import { NextRequest, NextResponse } from 'next/server';
import { serviceRepository } from '@/lib/services/service-repository';
import { UserProfileSession } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { EligibilityCheckInputSchema } from '@/lib/validation/schemas';
import { parseBoundedJson } from '@/lib/api/bounded-json';

export async function POST(req: NextRequest) {
  try {
    const boundedBody = await parseBoundedJson(req, 16_384);
    if (!boundedBody.ok) {
      return NextResponse.json({ error: boundedBody.error }, { status: boundedBody.status });
    }
    const parsed = EligibilityCheckInputSchema.safeParse(boundedBody.data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid eligibility request' }, { status: 400 });
    const { serviceId } = parsed.data;
    const input = parsed.data.session;
    const now = new Date().toISOString();
    const language = input.language as LanguageCode;
    const session: UserProfileSession = {
      sessionId: input.sessionId,
      createdAt: now,
      updatedAt: now,
      language,
      locale: input.locale || getLanguageConfig(language).locale,
      demographics: input.demographics ?? {},
      answers: input.answers ?? {},
      currentStepIndex: input.currentStepIndex ?? 0,
    };

    const service = await serviceRepository.getServiceById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    if (service.source.verificationStatus !== 'verified') {
      return NextResponse.json(
        { error: 'Eligibility checks are unavailable for unverified sample records.' },
        { status: 409 }
      );
    }

    const result = await serviceRepository.checkEligibility(serviceId, session);

    if (!result) {
      return NextResponse.json({ error: 'Service not found for eligibility check' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to evaluate eligibility' }, { status: 500 });
  }
}

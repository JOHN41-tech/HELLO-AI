import { NextRequest, NextResponse } from 'next/server';
import { serviceRepository } from '@/lib/services/service-repository';
import { UserProfileSession } from '@/types/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, session }: { serviceId: string; session: UserProfileSession } = body;

    if (!serviceId || !session) {
      return NextResponse.json({ error: 'Missing serviceId or session payload' }, { status: 400 });
    }

    const result = await serviceRepository.checkEligibility(serviceId, session);

    if (!result) {
      return NextResponse.json({ error: 'Service not found for eligibility check' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Eligibility check API error:', err);
    return NextResponse.json({ error: 'Failed to evaluate eligibility' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  const { wallet } = await params;

  try {
    // Check TrustRecord table
    const trustRecord = await (prisma as typeof prisma & { trustRecord: { findUnique: Function } }).trustRecord?.findUnique({
      where: { walletAddress: wallet },
    });

    // Also check verified CreatorVerificationRequests
    const verificationRequest = await prisma.creatorVerificationRequest.findFirst({
      where: {
        creatorProfile: { publicKey: wallet },
        status: 'APPROVED',
      },
      include: {
        creatorProfile: {
          select: { username: true, displayName: true, featured: true },
        },
      },
      orderBy: { decidedAt: 'desc' },
    });

    if (trustRecord) {
      return NextResponse.json({
        wallet,
        verified: trustRecord.level !== 'UNVERIFIED',
        level: trustRecord.level,
        platform: trustRecord.platform,
        handle: trustRecord.handle,
        displayName: trustRecord.displayName,
        verifiedAt: trustRecord.verifiedAt,
      });
    }

    if (verificationRequest) {
      return NextResponse.json({
        wallet,
        verified: true,
        level: verificationRequest.creatorProfile.featured ? 'FEATURED' : 'VERIFIED',
        platform: verificationRequest.platform,
        handle: verificationRequest.handle,
        displayName: verificationRequest.creatorProfile.displayName,
        verifiedAt: verificationRequest.decidedAt,
      });
    }

    return NextResponse.json({
      wallet,
      verified: false,
      level: 'UNVERIFIED',
      platform: null,
      handle: null,
      displayName: null,
      verifiedAt: null,
    });
  } catch (error) {
    console.error('[trust GET]', error);
    // Return unverified on DB error (don't block reads)
    return NextResponse.json({
      wallet,
      verified: false,
      level: 'UNVERIFIED',
      platform: null,
      handle: null,
      displayName: null,
      verifiedAt: null,
    });
  }
}

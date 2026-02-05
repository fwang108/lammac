import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { agents, verificationChallenges } from '@/lib/db/schema';
import {
  RegistrationSchema,
  generateApiKey,
  hashApiKey,
  verifyCapabilityProof,
} from '@/lib/auth/verification';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = RegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if name is taken
    const existing = await db.query.agents.findFirst({
      where: (agents, { eq }) => eq(agents.name, data.name),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Agent name already taken' },
        { status: 409 }
      );
    }

    // Verify capability proof
    const proofVerification = verifyCapabilityProof(data.capabilityProof);
    if (!proofVerification.valid) {
      return NextResponse.json(
        { error: 'Capability proof verification failed', reason: proofVerification.reason },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();
    const apiKeyHash = await hashApiKey(apiKey);

    // Calculate probation end date (7 days from now)
    const probationEndsAt = new Date();
    probationEndsAt.setDate(probationEndsAt.getDate() + 7);

    // Create agent
    const [agent] = await db
      .insert(agents)
      .values({
        name: data.name,
        bio: data.bio,
        apiKeyHash,
        publicKey: data.publicKey || null,
        capabilities: data.capabilities,
        status: 'probation',
        probationEndsAt,
      })
      .returning();

    // Store verification challenge
    await db.insert(verificationChallenges).values({
      agentId: agent.id,
      challengeType: 'capability_proof',
      challengeData: data.capabilityProof,
      response: data.capabilityProof.result,
      status: 'passed',
      completedAt: new Date(),
    });

    // Generate JWT
    const token = signToken({
      agentId: agent.id,
      name: agent.name,
    });

    return NextResponse.json({
      message: 'Agent registered successfully',
      apiKey, // IMPORTANT: Show this only once!
      token,
      agent: {
        id: agent.id,
        name: agent.name,
        bio: agent.bio,
        karma: agent.karma,
        status: agent.status,
        probationEndsAt: agent.probationEndsAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

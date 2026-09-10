import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviewSessions, user } from "@/lib/db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

const LIMIT = 50;

export async function GET(request: NextRequest) {
  const rows = await db
    .select({
      userId: interviewSessions.userId,
      name: user.name,
      image: user.image,
      count: sql<number>`count(*)::int`,
      avgScore: sql<number>`round(avg(${interviewSessions.score})::numeric, 1)`,
    })
    .from(interviewSessions)
    .innerJoin(user, eq(user.id, interviewSessions.userId))
    .where(
      and(
        eq(interviewSessions.status, "completed"),
        isNotNull(interviewSessions.score)
      )
    )
    .groupBy(interviewSessions.userId, user.id, user.name, user.image)
    .orderBy(
      sql`round(avg(${interviewSessions.score})::numeric, 1) desc nulls last`,
      sql`count(*) desc`
    )
    .limit(LIMIT);

  const entries = rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    name: row.name,
    image: row.image,
    avgScore: Number(row.avgScore),
    interviews: row.count,
  }));

  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);

  return NextResponse.json({
    entries,
    viewerId: session?.user.id ?? null,
    generatedAt: Date.now(),
  });
}
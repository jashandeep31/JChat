// services/chatQaCache.ts
import { redis, db } from "../lib/db.js";
import { ChatQuestion, ChatQuestionAnswer } from "@repo/db";

const LIST = (cid: string) => `chat:${cid}:qa`;
const SIZE = 10;
const TTL = 60 * 20;
const MAX = SIZE * 15;

export interface QAPair {
  question: ChatQuestion;
  answers: ChatQuestionAnswer[];
}

export async function cacheQAPair(cid: string, pair: QAPair) {
  await redis
    .multi()
    .lpush(LIST(cid), JSON.stringify(pair))
    .ltrim(LIST(cid), 0, MAX - 1)
    .expire(LIST(cid), TTL)
    .exec();
}

export async function getQAPairs(cid: string, page = 0): Promise<QAPair[]> {
  const start = page * SIZE;
  const end = start + SIZE - 1;

  const slice = await redis.lrange(LIST(cid), start, end);
  if (slice.length === SIZE) return slice.map((s) => JSON.parse(s) as QAPair);

  const rows = await db.chatQuestion.findMany({
    where: { chatId: cid },
    orderBy: { createdAt: "desc" },
    skip: start,
    take: SIZE,
    include: { ChatQuestionAnswer: { orderBy: { createdAt: "asc" } } },
  });

  const pairs = rows.map((q) => ({
    question: q,
    answers: q.ChatQuestionAnswer,
  }));

  if (pairs.length) {
    const pipe = redis.multi();
    pairs
      .slice()
      .reverse()
      .forEach((p) => pipe.lpush(LIST(cid), JSON.stringify(p)));
    pipe.ltrim(LIST(cid), 0, MAX - 1).expire(LIST(cid), TTL);
    await pipe.exec();
  }

  return pairs;
}

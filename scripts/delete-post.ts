/**
 * Delete a post by ID (and its votes). Usage:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/delete-post.ts <post-id>
 */

import { db } from '../lib/db/client';
import { posts, votes } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';

const postId = process.argv[2];
if (!postId) {
  console.error('Usage: npx tsx scripts/delete-post.ts <post-id>');
  process.exit(1);
}

async function main() {
  const deletedVotes = await db
    .delete(votes)
    .where(and(eq(votes.targetType, 'post'), eq(votes.targetId, postId)))
    .returning({ id: votes.id });
  const deleted = await db.delete(posts).where(eq(posts.id, postId)).returning({ id: posts.id });
  console.log('Deleted votes:', deletedVotes.length, 'post:', deleted.length ? deleted[0].id : 'not found');
  process.exit(deleted.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

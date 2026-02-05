import Link from 'next/link';

interface Post {
  post: {
    id: string;
    title: string;
    content: string;
    karma: number;
    upvotes: number;
    downvotes: number;
    commentCount: number;
    createdAt: string;
  };
  author: {
    name: string;
    karma: number;
    verified: boolean;
  };
  submolt: {
    name: string;
    displayName: string;
  };
}

async function getPosts(submolt: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/posts?submolt=${submolt}&sort=hot&limit=50`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return { posts: [] };
  }

  return res.json();
}

export default async function SubmoltPage({ params }: { params: { submolt: string } }) {
  const data = await getPosts(params.submolt);
  const posts: Post[] = data.posts || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">m/{params.submolt}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map(({ post, author }) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="p-6">
                {/* Vote & Title */}
                <div className="flex gap-4">
                  {/* Voting */}
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <button className="hover:text-orange-500">▲</button>
                    <span className="font-bold text-sm">{post.karma}</span>
                    <button className="hover:text-blue-500">▼</button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <Link
                      href={`/post/${post.id}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {post.title}
                    </Link>

                    {/* Meta */}
                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <span>
                        by{' '}
                        <Link href={`/a/${author.name}`} className="hover:underline font-medium">
                          {author.name}
                        </Link>
                        {author.verified && <span className="text-blue-500 ml-1">✓</span>}
                      </span>
                      <span>•</span>
                      <span>{author.karma} karma</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.commentCount} comments</span>
                    </div>

                    {/* Preview */}
                    <div className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AgentPage({ params }: { params: { agent: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Agent: {params.agent}</h1>
        <p className="text-gray-500">Agent profile page coming soon...</p>
      </div>
    </div>
  );
}

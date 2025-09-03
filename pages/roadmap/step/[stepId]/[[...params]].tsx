import Head from 'next/head';
import { useRouter } from 'next/router';

export default function StepDetailPage() {
  const router = useRouter();
  const { stepId, params } = router.query;

  return (
    <>
      <Head>
        <title>Step {stepId} - Fund Road</title>
      </Head>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Step {stepId}</h1>
          <p>Step detail en migration vers Next.js</p>
          <button 
            onClick={() => router.push('/roadmap')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retour à la roadmap
          </button>
        </div>
      </div>
    </>
  );
}
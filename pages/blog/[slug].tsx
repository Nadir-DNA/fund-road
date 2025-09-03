import Head from 'next/head';
import { useRouter } from 'next/router';

export default function BlogArticlePage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <>
      <Head>
        <title>Article: {slug} - Fund Road</title>
      </Head>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Article: {slug}</h1>
          <p>Article de blog en migration vers Next.js</p>
          <button 
            onClick={() => router.push('/blog')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retour au blog
          </button>
        </div>
      </div>
    </>
  );
}
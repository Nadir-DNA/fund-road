import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ConfirmPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Confirmation - Fund Road</title>
      </Head>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Confirmation</h1>
          <p>Page de confirmation en migration vers Next.js</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </>
  );
}
import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Fund Road - Votre plateforme de financement startup</title>
        <meta name="description" content="Plateforme complète pour accompagner votre startup dans sa recherche de financement" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Fund Road</h1>
          <p className="text-xl mb-8 text-slate-200">Migration vers Next.js en cours...</p>
          <p className="text-lg text-slate-300">L'application sera bientôt disponible avec la nouvelle architecture.</p>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
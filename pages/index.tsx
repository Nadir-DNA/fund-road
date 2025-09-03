import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Fund Road - Votre plateforme de financement startup</title>
        <meta name="description" content="Plateforme complète pour accompagner votre startup dans sa recherche de financement" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 1rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Fund Road
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            color: '#e2e8f0'
          }}>
            Migration vers Next.js en cours...
          </p>
          <p style={{
            fontSize: '1.125rem',
            color: '#cbd5e1'
          }}>
            L'application sera bientôt disponible avec la nouvelle architecture.
          </p>
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '0.5rem',
            maxWidth: '24rem',
            margin: '2rem auto 0',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#cbd5e1'
            }}>
              ✅ Next.js configuré<br/>
              ✅ Pages Router actif<br/>
              🔄 Migration des composants
            </p>
          </div>
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
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch for faster resource loading */}
        <link rel="dns-prefetch" href="//cdn.gpteng.co" />
        
        {/* Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          />
        </noscript>
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/lovable-uploads/5766c4d5-0e50-4267-9dce-865a0a4882ec.png" />
        <link rel="apple-touch-icon" href="/lovable-uploads/5766c4d5-0e50-4267-9dce-865a0a4882ec.png" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LNJG435Q0H" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-LNJG435Q0H');
              });
            `,
          }}
        />
        
        {/* GPT Engineer Script */}
        <script src="https://cdn.gpteng.co/gptengineer.js" type="module" defer />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
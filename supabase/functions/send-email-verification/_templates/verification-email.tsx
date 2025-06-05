
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Hr,
  Section,
} from 'npm:@react-email/components@0.0.11'
import * as React from 'npm:react@18.3.1'

interface EmailVerificationProps {
  confirmationUrl: string;
  userEmail: string;
  token?: string;
}

export const VerificationEmail = ({
  confirmationUrl,
  userEmail,
  token,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Vérifiez votre adresse email pour Fund Road</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <img
            src="https://global-uploads.webflow.com/64c8bea13859c1d0e9363f36/64c8bea13859c1d0e9363f4c_fundroad-blue.webp"
            alt="Fund Road Logo"
            width="150"
            height="42"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Vérification de votre adresse email</Heading>
        <Text style={text}>
          Bonjour,
        </Text>
        <Text style={text}>
          Merci de vous être inscrit sur Fund Road ! Pour finaliser votre inscription et accéder à votre roadmap d'entrepreneuriat, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
        </Text>
        <Section style={buttonContainer}>
          <Link href={confirmationUrl} style={buttonLink}>
            Confirmer mon email
          </Link>
        </Section>
        {token && (
          <>
            <Text style={text}>
              Vous pouvez également utiliser ce code de confirmation temporaire :
            </Text>
            <Text style={code}>{token}</Text>
          </>
        )}
        <Text style={text}>
          Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :
        </Text>
        <Text style={link}>{confirmationUrl}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          Une fois votre email confirmé, vous serez automatiquement redirigé vers votre tableau de bord Fund Road.
        </Text>
        <Text style={footer}>
          Si vous n'avez pas créé de compte sur Fund Road, vous pouvez ignorer cet email en toute sécurité.
        </Text>
        <Text style={footer}>
          Cet email a été envoyé à {userEmail}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '45px',
  maxWidth: '600px',
}

const logoContainer = {
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#1a1a1a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333333',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const buttonLink = {
  backgroundColor: '#2754C5',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'inline-block',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
  padding: '12px 24px',
}

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontFamily: 'monospace',
  fontSize: '18px',
  textAlign: 'center' as const,
  letterSpacing: '2px',
  margin: '16px 0',
}

const link = {
  color: '#2754C5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '14px',
  textDecoration: 'underline',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
}

const footer = {
  color: '#666666',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '12px 0',
}

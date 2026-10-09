import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Img,
  Section,
} from '@react-email/components';

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'jungo-green': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
        },
        'jungo-brown': {
          50: '#EDE5E0',
          200: '#D6C8C0',
          300: '#B09B8B',
          500: '#8B6F5D',
          600: '#7A5E4E',
          700: '#6A4E3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
};

interface EmailShellProps {
  previewText: string;
  children: React.ReactNode;
  logoUrl?: string;
}

export function EmailShell({ previewText, children, logoUrl }: EmailShellProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body style={{ backgroundColor: '#F3F4F6', margin: 0, padding: 0, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px' }}>
            {logoUrl && (
              <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Img
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  style={{ margin: '0 auto', display: 'block' }}
                />
              </Section>
            )}
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

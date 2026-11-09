import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Section,
  Font,
  Button,
  Link,
} from '@react-email/components';

const BRAND_GREEN = '#6AAA47';
const CTA_GREEN = '#3F7A2A';
const WEBSITE_URL = 'https://jungosolutions.com/';
const CTA_TEXT = 'Branch Out with Jungo';

interface EmailShellProps {
  previewText: string;
  children: React.ReactNode;
  assetBaseUrl: string;
}

export function EmailShell({ previewText, children, assetBaseUrl }: EmailShellProps) {
  const base = assetBaseUrl.replace(/\/$/, '');

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter, Arial, sans-serif"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
        />
        <style>{`
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#F3F4F6', margin: 0, padding: 0, fontFamily: 'Inter, Arial, sans-serif' }}>
        <table cellPadding={0} cellSpacing={0} border={0} width="100%" role="presentation" style={{ backgroundColor: '#F3F4F6' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '24px 12px' }}>
                <Container className="email-container" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '32px 24px' }}>
                  <Section style={{ textAlign: 'center' }}>
                    <Img
                      src={`${base}/Jungo_logo_tree_only_transparent.png`}
                      alt="Jungo Solutions"
                      width={96}
                      height={102}
                      style={{ margin: '0 auto', display: 'block', border: 0, outline: 'none' }}
                    />
                  </Section>
                  <Section style={{ height: '24px', lineHeight: '24px' }} />
                  <table cellPadding={0} cellSpacing={0} border={0} width="100%" role="presentation" style={{ borderCollapse: 'separate', border: `2px solid ${BRAND_GREEN}`, borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '24px' }}>
                          {children}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Section style={{ height: '32px', lineHeight: '32px' }} />
                  <Section style={{ textAlign: 'center' }}>
                    <Link href={WEBSITE_URL}>
                      <Img
                        src={`${base}/Jungo_logo_greenbrown_no_background.png`}
                        alt="Jungo Solutions"
                        width={180}
                        height={93}
                        style={{ margin: '0 auto', display: 'block', border: 0, outline: 'none' }}
                      />
                    </Link>
                  </Section>
                  <Section style={{ height: '24px', lineHeight: '24px' }} />
                  <Section style={{ textAlign: 'center' }}>
                    <Button
                      href={WEBSITE_URL}
                      style={{
                        backgroundColor: CTA_GREEN,
                        color: '#FFFFFF',
                        padding: '12px 28px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      {CTA_TEXT}
                    </Button>
                  </Section>
                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}

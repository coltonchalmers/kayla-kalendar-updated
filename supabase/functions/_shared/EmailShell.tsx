import React from "npm:react@18.3.1";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Section,
  Font,
} from "npm:@react-email/components@0.0.36";

interface EmailShellProps {
  previewText: string;
  children: React.ReactNode;
  logoUrl?: string;
}

export function EmailShell({ previewText, children, logoUrl }: EmailShellProps) {
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
        {/* Outlook wrapper table */}
        <table cellPadding={0} cellSpacing={0} border={0} width="100%" role="presentation" style={{ backgroundColor: '#F3F4F6' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '24px 12px' }}>
                <Container style={{ maxWidth: '600px', width: '100%', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px' }}>
                  {logoUrl && (
                    <>
                      <Section style={{ textAlign: 'center' }}>
                        <Img
                          src={logoUrl}
                          alt="Logo"
                          width={120}
                          style={{ margin: '0 auto', display: 'block' }}
                        />
                      </Section>
                      <Section style={{ height: '24px', lineHeight: '24px' }} />
                    </>
                  )}
                  {children}
                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}

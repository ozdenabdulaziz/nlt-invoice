import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type VerificationEmailProps = {
  verificationUrl: string;
};

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  const preview = "Verify your email to activate your NLT Invoice account";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Text style={styles.brand}>NLT Invoice</Text>
            <Text style={styles.greeting}>Welcome, and thanks for signing up.</Text>
            <Text style={styles.message}>
              Please verify your email address to activate your account and securely access your
              dashboard.
            </Text>

            <Section style={{ textAlign: "center", marginBottom: "24px" }}>
              <Button href={verificationUrl} style={styles.button}>
                Verify Email
              </Button>
            </Section>

            <Text style={styles.buttonHint}>
              If the button does not work, copy and paste this link into your browser:
            </Text>
            <Text style={styles.linkLine}>
              <span style={styles.linkText}>{verificationUrl}</span>
            </Text>

            <Text style={styles.buttonHint}>
              This link will expire in 24 hours.
            </Text>
            <Text style={styles.securityNote}>
              If you did not create an NLT Invoice account, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Text style={styles.footer}>NLT Invoice Security Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: "32px 0",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e5e7eb",
  },
  brand: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#111827",
    marginTop: 0,
    marginBottom: "14px",
  },
  greeting: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginTop: 0,
    marginBottom: "16px",
  },
  message: {
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.6",
    marginTop: 0,
    marginBottom: "24px",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: "9999px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 28px",
    display: "inline-block",
  },
  buttonHint: {
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: "1.5",
    marginTop: "16px",
    marginBottom: 0,
  },
  linkLine: {
    marginTop: "8px",
    marginBottom: 0,
  },
  linkText: {
    color: "#0f172a",
    wordBreak: "break-all" as const,
  },
  securityNote: {
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: "1.5",
    marginTop: "18px",
    marginBottom: 0,
  },
  divider: {
    borderColor: "#e5e7eb",
    margin: "24px 0",
  },
  footer: {
    fontSize: "12px",
    color: "#9ca3af",
    lineHeight: "1.5",
    margin: 0,
    textAlign: "center" as const,
  },
};

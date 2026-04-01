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

type InvoiceEmailProps = {
  companyName: string;
  customerName: string;
  invoiceNumber: string;
  invoiceTotal: string;
  currency: string;
  dueDate: string;
  viewUrl: string;
  senderNote?: string | null;
};

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

export function InvoiceEmail({
  companyName,
  customerName,
  invoiceNumber,
  invoiceTotal,
  currency,
  dueDate,
  viewUrl,
  senderNote,
}: InvoiceEmailProps) {
  const formattedTotal = formatCurrency(invoiceTotal, currency);
  const preview = `${companyName} sent you an invoice for ${formattedTotal} — due ${dueDate}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.companyName}>{companyName}</Text>
          </Section>

          {/* Main card */}
          <Section style={styles.card}>
            <Text style={styles.greeting}>
              Hi {customerName},
            </Text>
            <Text style={styles.message}>
              {companyName} has sent you an invoice. Please find the details
              below.
            </Text>

            {/* Invoice summary */}
            <Section style={styles.summaryBox}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={styles.summaryLabel}>Invoice number</td>
                    <td style={styles.summaryValue}>{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={styles.summaryLabel}>Amount due</td>
                    <td style={{ ...styles.summaryValue, ...styles.amountValue }}>
                      {formattedTotal}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.summaryLabel}>Due date</td>
                    <td style={styles.summaryValue}>{dueDate}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {senderNote ? (
              <Section style={styles.noteBox}>
                <Text style={styles.noteLabel}>Note from {companyName}</Text>
                <Text style={styles.noteText}>{senderNote}</Text>
              </Section>
            ) : null}

            <Button href={viewUrl} style={styles.button}>
              View Invoice
            </Button>

            <Text style={styles.buttonHint}>
              Or copy this link:{" "}
              <span style={styles.linkText}>{viewUrl}</span>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Text style={styles.footer}>
            You received this email because {companyName} sent you an invoice
            using NLT Invoice. If you have questions, please contact{" "}
            {companyName} directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Styles (inline — required for email clients)
// ---------------------------------------------------------------------------
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
  header: {
    padding: "0 0 16px",
  },
  companyName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    margin: 0,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e5e7eb",
  },
  greeting: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginTop: 0,
    marginBottom: "8px",
  },
  message: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginTop: 0,
    marginBottom: "24px",
  },
  summaryBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    padding: "6px 0",
    width: "40%",
  } as React.CSSProperties,
  summaryValue: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
    padding: "6px 0",
    textAlign: "right" as const,
  } as React.CSSProperties,
  amountValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  noteBox: {
    borderLeft: "3px solid #d1d5db",
    paddingLeft: "12px",
    marginBottom: "24px",
  },
  noteLabel: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#9ca3af",
    margin: "0 0 4px",
  },
  noteText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.5",
    margin: 0,
  },
  button: {
    backgroundColor: "#1e3a5f",
    borderRadius: "9999px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 28px",
    display: "inline-block",
  },
  buttonHint: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "12px",
    marginBottom: 0,
  },
  linkText: {
    color: "#6b7280",
    wordBreak: "break-all" as const,
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
  },
};

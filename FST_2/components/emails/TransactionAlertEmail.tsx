import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface TransactionAlertEmailProps {
  tenantName: string;
  reference: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  createdByName: string;
  createdAt: string;
}

export const TransactionAlertEmail: React.FC<Readonly<TransactionAlertEmailProps>> = ({
  tenantName = "SecureOps Enterprise",
  reference = "TX-892147",
  amount = "$12,450.00",
  currency = "USD",
  status = "COMPLETED",
  description = "Infrastructure Payment Provisioning",
  createdByName = "Security Officer",
  createdAt = new Date().toISOString(),
}) => {
  const isCompleted = status === "COMPLETED";

  return (
    <Html>
      <Head />
      <Preview>Transaction Notification: {reference} ({status})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>SECUREOPS</Text>
            <Text style={subHeader}>Enterprise Transaction & Security Operations</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Transaction Event Recorded</Heading>
            <Text style={paragraph}>
              A transactional state mutation was committed for tenant{" "}
              <strong>{tenantName}</strong>.
            </Text>

            <Section style={card}>
              <Text style={cardRow}>
                <span style={label}>Reference ID:</span> <code>{reference}</code>
              </Text>
              <Text style={cardRow}>
                <span style={label}>Amount:</span>{" "}
                <span style={amountStyle}>{amount} {currency}</span>
              </Text>
              <Text style={cardRow}>
                <span style={label}>Status:</span>{" "}
                <span style={isCompleted ? statusSuccess : statusPending}>{status}</span>
              </Text>
              <Text style={cardRow}>
                <span style={label}>Description:</span> {description}
              </Text>
              <Text style={cardRow}>
                <span style={label}>Initiated By:</span> {createdByName}
              </Text>
              <Text style={cardRow}>
                <span style={label}>Timestamp:</span> {createdAt}
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              This is an automated transactional security alert dispatched by SecureOps
              Relational Pipeline. Do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionAlertEmail;

const main = {
  backgroundColor: "#f4f5f7",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "24px 0 48px",
  maxWidth: "580px",
};

const header = {
  backgroundColor: "#0f172a",
  padding: "24px",
  borderRadius: "8px 8px 0 0",
  textAlign: "center" as const,
};

const logoText = {
  color: "#38bdf8",
  fontSize: "22px",
  fontWeight: "bold",
  letterSpacing: "2px",
  margin: "0 0 4px 0",
};

const subHeader = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: 0,
};

const content = {
  backgroundColor: "#ffffff",
  padding: "32px 24px",
  borderRadius: "0 0 8px 8px",
  border: "1px solid #e2e8f0",
};

const heading = {
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const paragraph = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px 0",
};

const card = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const cardRow = {
  fontSize: "13px",
  color: "#334155",
  margin: "6px 0",
};

const label = {
  fontWeight: "600",
  color: "#64748b",
  display: "inline-block",
  width: "120px",
};

const amountStyle = {
  fontWeight: "700",
  color: "#0f172a",
};

const statusSuccess = {
  backgroundColor: "#dcfce7",
  color: "#15803d",
  padding: "2px 8px",
  borderRadius: "4px",
  fontWeight: "600",
  fontSize: "12px",
};

const statusPending = {
  backgroundColor: "#fef3c7",
  color: "#b45309",
  padding: "2px 8px",
  borderRadius: "4px",
  fontWeight: "600",
  fontSize: "12px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0 16px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
};

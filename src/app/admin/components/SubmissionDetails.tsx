import { SubmissionData } from "./SubmissionsTable";
import { useLanguage } from "@/context/LanguageContext";

interface SubmissionDetailsProps {
  submission: SubmissionData;
}

export function SubmissionDetails({ submission }: SubmissionDetailsProps) {
  const { t } = useLanguage();

  // Exclude metadata from the main view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, userId, userEmail, createdAt, completedAt, version, summary, ...data } = submission;

  // Mapping of internal keys to translated labels
  const labelMapping: Record<string, string> = {
    projectOverview: t.sections.overview.title,
    aiFeatures: t.sections.ai.title,
    paymentMethods: t.sections.payments.title,
    design: t.sections.design.title,
    communication: t.sections.communication.title,
    features: "6. Funcionalidades Adicionales / Features",
    admin: "7. Administración / Admin",
    logistics: "8. Logística / Logistics",
    content: "9. Contenido / Content",
    additionalInfo: "10. Información Adicional / Additional Info",
  };

  // Get all keys present in the data object
  const allKeys = Object.keys(data);

  // Define the order we want to display known sections
  const orderedSections = [
    "projectOverview",
    "aiFeatures",
    "paymentMethods",
    "design",
    "communication",
    "features",
    "admin",
    "logistics",
    "content",
    "additionalInfo",
  ];

  // Identify any keys that are NOT in our ordered list (custom or legacy data)
  const unknownKeys = allKeys.filter(key => !orderedSections.includes(key));

  return (
    <div className="space-y-8">
      {/* Contact Summary Section - Always first */}
      <DetailSection title={`0. ${t.gate.identification}`}>
        <DetailRow label={t.gate.companyLabel} value={renderValue(summary?.businessName, t)} />
        <DetailRow label={t.gate.nameLabel} value={renderValue(summary?.contactName, t)} />
        <DetailRow label={t.gate.emailLabel} value={renderValue(summary?.contactEmail || userEmail, t)} />
      </DetailSection>

      {/* Render known sections in order */}
      {orderedSections.map((key) => {
        const sectionValue = (data as Record<string, unknown>)[key];
        if (sectionValue === undefined || sectionValue === null) return null;

        return (
          <DetailSection key={key} title={labelMapping[key] || formatKey(key)}>
            {typeof sectionValue === "object" && sectionValue !== null ? (
              Object.entries(sectionValue).map(([subKey, value]) => (
                <DetailRow
                  key={subKey}
                  label={formatKey(subKey)}
                  value={renderValue(value, t)}
                />
              ))
            ) : (
              <DetailRow
                label={formatKey(key)}
                value={renderValue(sectionValue, t)}
              />
            )}
          </DetailSection>
        );
      })}

      {/* Render any unknown/custom fields found in Firestore */}
      {unknownKeys.length > 0 && (
        <div className="pt-4 border-t-2 border-dashed border-primary/20">
          <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-4">
            Datos Adicionales / Custom Data
          </h4>
          {unknownKeys.map((key) => {
            const sectionValue = (data as Record<string, unknown>)[key];
            return (
              <DetailSection key={key} title={formatKey(key)}>
                {typeof sectionValue === "object" && sectionValue !== null ? (
                  Object.entries(sectionValue).map(([subKey, value]) => (
                    <DetailRow
                      key={subKey}
                      label={formatKey(subKey)}
                      value={renderValue(value, t)}
                    />
                  ))
                ) : (
                  <DetailRow
                    label={formatKey(key)}
                    value={renderValue(sectionValue, t)}
                  />
                )}
              </DetailSection>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helpers
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderValue(value: any, t: any): React.ReactNode {
  if (value === true) return <span className="text-green-500 font-medium">✓ {t.admin.details.yes}</span>;
  if (value === false) return <span className="text-muted-foreground">✗ {t.admin.details.no}</span>;
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground italic">{t.admin.details.unspecified}</span>;
  return <span>{String(value)}</span>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold border-b pb-2 text-primary">{title}</h3>
      <div className="space-y-2 pl-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm border-b border-border/30 pb-1">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="sm:col-span-2">{value}</span>
    </div>
  );
}

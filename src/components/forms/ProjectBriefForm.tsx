// src/components/forms/ProjectBriefForm.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { User } from "firebase/auth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
// import { cn } from "@/lib/utils";
import {
  ProjectBriefData,
  initialProjectBriefData,
} from "@/types/project-brief";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/icons/spinner";
import { AuthGate } from "@/components/auth/AuthGate";

export function ProjectBriefForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData, isLoadingStorage] =
    useLocalStorage<ProjectBriefData>(
      "project-discovery-brief",
      initialProjectBriefData
    );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isUnlocked, setIsUnlocked] = useState(false);

  const projectTypeOptions: RadioOption[] = [
    { value: "ecommerce", label: t.projectTypes.ecommerce.label, description: t.projectTypes.ecommerce.desc },
    { value: "landing", label: t.projectTypes.landing.label, description: t.projectTypes.landing.desc },
    { value: "portfolio", label: t.projectTypes.portfolio.label, description: t.projectTypes.portfolio.desc },
    { value: "corporate", label: t.projectTypes.corporate.label, description: t.projectTypes.corporate.desc },
    { value: "custom", label: t.projectTypes.custom.label, description: t.projectTypes.custom.desc },
  ];

  const designStyleOptions: RadioOption[] = [
    { value: "minimalist", label: t.designStyles.minimalist.label, description: t.designStyles.minimalist.desc },
    { value: "vibrant", label: t.designStyles.vibrant.label, description: t.designStyles.vibrant.desc },
    { value: "professional", label: t.designStyles.professional.label, description: t.designStyles.professional.desc },
    { value: "luxury", label: t.designStyles.luxury.label, description: t.designStyles.luxury.desc },
  ];

  const progress = calculateProgress(formData);

  const prevUserRef = useRef<User | null>(user);

  // Effect to handle logout transition
  useEffect(() => {
    if (prevUserRef.current && !user) {
      // User just logged out, lock the form and clear the identifying info
      setIsUnlocked(false);
      setFormData((prev: ProjectBriefData) => ({
        ...prev,
        summary: {
          ...prev.summary,
          contactName: "",
          contactEmail: "",
        }
      }));
    }
    prevUserRef.current = user;
  }, [user, setFormData]);

  // Effect to handle automatic unlocking if user is logged in via Google
  useEffect(() => {
    if (isLoadingStorage) return;

    if (user && !isUnlocked) {
      setIsUnlocked(true);
    }
  }, [user, isUnlocked, isLoadingStorage]);

  useEffect(() => {
    if (!isLoadingStorage) {
      setAutoSaveIndicator(true);
      const timer = setTimeout(() => setAutoSaveIndicator(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [formData, isLoadingStorage]);

  const updateFormData = (updates: Partial<ProjectBriefData>) => {
    setFormData((prev: ProjectBriefData) => ({ ...prev, ...updates }));
    setValidationErrors((prev: Record<string, string>) => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateIdentification = () => {
    const errors: Record<string, string> = {};
    if (!formData.summary.contactName.trim()) errors.contactName = t.gate.nameRequired;
    if (!formData.summary.contactEmail.trim()) errors.contactEmail = t.gate.emailRequired;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleManualUnlock = () => {
    if (validateIdentification()) {
      setIsUnlocked(true);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.summary.businessName.trim()) {
      errors.businessName = t.form.errorProjectName;
    }
    if (!formData.projectOverview.projectType) {
      errors.projectType = t.form.errorProjectType;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!db) {
      setSubmitError(t.form.errorFirebase);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const currentUser = auth?.currentUser;
      await addDoc(collection(db, "project-planning-responses"), {
        ...formData,
        userId: currentUser?.uid || "anonymous_identified",
        userName: currentUser?.displayName || null,
        userEmail: currentUser?.email || formData.summary.contactEmail,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        version: 2,
      });

      setSubmitSuccess(true);
      localStorage.removeItem("project-discovery-brief");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      const err = error as { code?: string };
      setSubmitError(err.code === "permission-denied" ? t.form.errorPermission : t.form.errorGeneral);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStorage) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-2xl">
          <h2 className="text-h1 mb-4 gradient-text">{t.form.successTitle}</h2>
          <p className="text-muted-foreground mb-6">{t.form.successMessage}</p>
          <Button onClick={() => { setSubmitSuccess(false); setFormData(initialProjectBriefData); setIsUnlocked(false); }}>{t.form.newBriefButton}</Button>
        </Card>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <AuthGate
        mode="public"
        onManualUnlock={handleManualUnlock}
        formData={{
          businessName: formData.summary.businessName,
          contactName: formData.summary.contactName,
          contactEmail: formData.summary.contactEmail,
        }}
        onFormDataChange={(field, value) => {
          updateFormData({
            summary: { ...formData.summary, [field]: value },
          });
        }}
        validationErrors={validationErrors}
      />
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-h1 sm:text-display-lg mb-4">{t.form.title} <span className="gradient-text">{t.form.highlight}</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t.form.subtitle}</p>
      </div>

      <div className="mb-8 sticky top-20 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t.form.progress}: {progress.toFixed(0)}%</span>
          {autoSaveIndicator && <span className="text-xs text-green-500">{t.form.saved} ✓</span>}
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-12">
        {/* Section 1: Overview */}
        <FormSection title={t.sections.overview.title} description={t.sections.overview.description}>
          <div className="space-y-6">
            <Input
              label={t.sections.overview.businessNameLabel}
              placeholder={t.gate.companyPlaceholder}
              value={formData.summary.businessName}
              error={validationErrors.businessName}
              onChange={(e) => updateFormData({ summary: { ...formData.summary, businessName: e.target.value } })}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.overview.projectTypeLabel}</p>
              <RadioGroup
                name="projectType"
                value={formData.projectOverview.projectType}
                options={projectTypeOptions}
                error={validationErrors.projectType}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(val) => updateFormData({ projectOverview: { ...formData.projectOverview, projectType: val as any } })}
              />
            </div>
            <Textarea
              label={t.sections.overview.goalLabel}
              placeholder={t.sections.overview.goalPlaceholder}
              value={formData.projectOverview.primaryGoal}
              onChange={(e) => updateFormData({ projectOverview: { ...formData.projectOverview, primaryGoal: e.target.value } })}
            />
          </div>
        </FormSection>

        {/* Section 2: Funcionalidades AI */}
        <FormSection title={t.sections.ai.title} description={t.sections.ai.description}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.ai.assistantLabel}</p>
              <RadioGroup
                name="aiAssistant"
                value={formData.aiFeatures.assistant}
                options={[
                  { value: "complete", label: t.sections.ai.assistantOptions.complete.label, description: t.sections.ai.assistantOptions.complete.desc },
                  { value: "simple", label: t.sections.ai.assistantOptions.simple.label, description: t.sections.ai.assistantOptions.simple.desc },
                  { value: "none", label: t.sections.ai.assistantOptions.none.label, description: t.sections.ai.assistantOptions.none.desc },
                ]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(val) => updateFormData({ aiFeatures: { ...formData.aiFeatures, assistant: val as any } })}
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium">{t.sections.ai.otherCapabilities}</p>
              <Checkbox
                id="ai-image"
                label={t.sections.ai.imageGen}
                checked={formData.aiFeatures.imageGeneration}
                onChange={(checked) => updateFormData({ aiFeatures: { ...formData.aiFeatures, imageGeneration: checked } })}
              />
              <Checkbox
                id="ai-content"
                label={t.sections.ai.contentCreation}
                checked={formData.aiFeatures.contentCreation}
                onChange={(checked) => updateFormData({ aiFeatures: { ...formData.aiFeatures, contentCreation: checked } })}
              />
            </div>
          </div>
        </FormSection>

        {/* Section 3: Pagos y Moneda */}
        <FormSection title={t.sections.payments.title} description={t.sections.payments.description}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Checkbox
                id="pay-wallet"
                label={t.sections.payments.digitalWallets}
                checked={formData.paymentMethods.digitalWallet1}
                onChange={(checked) => updateFormData({ paymentMethods: { ...formData.paymentMethods, digitalWallet1: checked } })}
              />
              <Checkbox
                id="pay-card"
                label={t.sections.payments.creditCards}
                checked={formData.paymentMethods.creditCard}
                onChange={(checked) => updateFormData({ paymentMethods: { ...formData.paymentMethods, creditCard: checked } })}
              />
              <Checkbox
                id="pay-bank"
                label={t.sections.payments.bankTransfer}
                checked={formData.paymentMethods.bankTransfer}
                onChange={(checked) => updateFormData({ paymentMethods: { ...formData.paymentMethods, bankTransfer: checked } })}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.payments.currencyLabel}</p>
              <RadioGroup
                name="currency"
                value={formData.paymentMethods.currency}
                options={[
                  { value: "USD", label: t.sections.payments.currencies.USD },
                  { value: "PEN", label: t.sections.payments.currencies.PEN },
                  { value: "EUR", label: t.sections.payments.currencies.EUR },
                ]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(val) => updateFormData({ paymentMethods: { ...formData.paymentMethods, currency: val as any } })}
              />
            </div>
          </div>
        </FormSection>

        {/* Section 4: Diseño */}
        <FormSection title={t.sections.design.title} description={t.sections.design.description}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.design.styleLabel}</p>
              <RadioGroup
                name="designStyle"
                value={formData.design.style}
                options={designStyleOptions}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(val) => updateFormData({ design: { ...formData.design, style: val as any } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{t.sections.design.hasLogoLabel}</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={formData.design.hasLogo === true} onChange={() => updateFormData({ design: { ...formData.design, hasLogo: true } })} className="accent-primary" /> {t.sections.design.yes}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={formData.design.hasLogo === false} onChange={() => updateFormData({ design: { ...formData.design, hasLogo: false } })} className="accent-primary" /> {t.sections.design.no}
                  </label>
                </div>
              </div>
            </div>
            <Input
              label={t.sections.design.brandColorsLabel}
              placeholder={t.sections.design.brandColorsPlaceholder}
              value={formData.design.brandColors}
              onChange={(e) => updateFormData({ design: { ...formData.design, brandColors: e.target.value } })}
            />
          </div>
        </FormSection>

        {/* Section 5: Comunicación */}
        <FormSection title={t.sections.communication.title} description={t.sections.communication.description}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox id="comm-wa" label={t.sections.communication.whatsapp} checked={formData.communication.whatsappIntegration} onChange={(c) => updateFormData({ communication: { ...formData.communication, whatsappIntegration: c } })} />
            <Checkbox id="comm-form" label={t.sections.communication.contactForm} checked={formData.communication.contactForm} onChange={(c) => updateFormData({ communication: { ...formData.communication, contactForm: c } })} />
            <Checkbox id="comm-chat" label={t.sections.communication.liveChat} checked={formData.communication.liveChat} onChange={(c) => updateFormData({ communication: { ...formData.communication, liveChat: c } })} />
            <Checkbox id="comm-email" label={t.sections.communication.emailMarketing} checked={formData.communication.emailMarketing} onChange={(c) => updateFormData({ communication: { ...formData.communication, emailMarketing: c } })} />
          </div>
        </FormSection>

        {/* Section 6: Timeline & Budget */}
        <FormSection title={t.sections.timeline.title} description={t.sections.timeline.description}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.timeline.budgetLabel}</p>
              <RadioGroup
                name="budgetRange"
                value={formData.projectOverview.budgetRange}
                options={[
                  { value: "small", label: t.sections.timeline.budgetOptions.small.label, description: t.sections.timeline.budgetOptions.small.desc },
                  { value: "medium", label: t.sections.timeline.budgetOptions.medium.label, description: t.sections.timeline.budgetOptions.medium.desc },
                  { value: "large", label: t.sections.timeline.budgetOptions.large.label, description: t.sections.timeline.budgetOptions.large.desc },
                  { value: "enterprise", label: t.sections.timeline.budgetOptions.enterprise.label, description: t.sections.timeline.budgetOptions.enterprise.desc },
                ]}
                onChange={(val) => updateFormData({ projectOverview: { ...formData.projectOverview, budgetRange: val } })}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.timeline.deadlineLabel}</p>
              <RadioGroup
                name="deadline"
                value={formData.projectOverview.deadline}
                options={[
                  { value: "urgent", label: t.sections.timeline.deadlineOptions.urgent },
                  { value: "short", label: t.sections.timeline.deadlineOptions.short },
                  { value: "medium", label: t.sections.timeline.deadlineOptions.medium },
                  { value: "flexible", label: t.sections.timeline.deadlineOptions.flexible },
                ]}
                onChange={(val) => updateFormData({ projectOverview: { ...formData.projectOverview, deadline: val } })}
              />
            </div>
            <Textarea
              label={t.sections.timeline.audienceLabel}
              placeholder={t.sections.timeline.audiencePlaceholder}
              value={formData.projectOverview.targetAudience}
              onChange={(e) => updateFormData({ projectOverview: { ...formData.projectOverview, targetAudience: e.target.value } })}
            />
          </div>
        </FormSection>

        {/* Section 7: Features */}
        <FormSection title={t.sections.features.title} description={t.sections.features.description}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox id="feat-accounts" label={t.sections.features.userAccounts} checked={formData.features.userAccounts} onChange={(c) => updateFormData({ features: { ...formData.features, userAccounts: c } })} />
            <Checkbox id="feat-booking" label={t.sections.features.bookingSystem} checked={formData.features.bookingSystem} onChange={(c) => updateFormData({ features: { ...formData.features, bookingSystem: c } })} />
            <Checkbox id="feat-reviews" label={t.sections.features.reviews} checked={formData.features.reviews} onChange={(c) => updateFormData({ features: { ...formData.features, reviews: c } })} />
            <Checkbox id="feat-blog" label={t.sections.features.blog} checked={formData.features.blog} onChange={(c) => updateFormData({ features: { ...formData.features, blog: c } })} />
            <Checkbox id="feat-multilingual" label={t.sections.features.multilingual} checked={formData.features.multilingual} onChange={(c) => updateFormData({ features: { ...formData.features, multilingual: c } })} />
            <Checkbox id="feat-support" label={t.sections.features.dedicatedSupport} checked={formData.features.dedicatedSupport} onChange={(c) => updateFormData({ features: { ...formData.features, dedicatedSupport: c } })} />
            <Checkbox id="feat-responsive" label={t.sections.features.responsiveDesign} checked={formData.features.responsiveDesign} onChange={(c) => updateFormData({ features: { ...formData.features, responsiveDesign: c } })} />
            <Checkbox id="feat-seo" label={t.sections.features.seoOptimization} checked={formData.features.seoOptimization} onChange={(c) => updateFormData({ features: { ...formData.features, seoOptimization: c } })} />
          </div>
        </FormSection>

        {/* Section 8: Content & Materials */}
        <FormSection title={t.sections.content.title} description={t.sections.content.description}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.content.hasPhotosLabel}</p>
              <RadioGroup
                name="hasPhotos"
                value={formData.content.hasPhotos || ""}
                options={[
                  { value: "yes", label: t.sections.content.hasPhotosOptions.yes },
                  { value: "some", label: t.sections.content.hasPhotosOptions.some },
                  { value: "no", label: t.sections.content.hasPhotosOptions.no },
                ]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(val) => updateFormData({ content: { ...formData.content, hasPhotos: val as any } })}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.sections.content.hasTextLabel}</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={formData.content.hasTextContent === true} onChange={() => updateFormData({ content: { ...formData.content, hasTextContent: true } })} className="accent-primary" /> {t.sections.design.yes}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={formData.content.hasTextContent === false} onChange={() => updateFormData({ content: { ...formData.content, hasTextContent: false } })} className="accent-primary" /> {t.sections.design.no}
                </label>
              </div>
            </div>
            <Input
              label={t.sections.content.hostingLabel}
              placeholder={t.sections.content.hostingPlaceholder}
              value={formData.content.hostingProvider}
              onChange={(e) => updateFormData({ content: { ...formData.content, hostingProvider: e.target.value } })}
            />
            <Input
              label={t.sections.content.domainLabel}
              placeholder={t.sections.content.domainPlaceholder}
              value={formData.content.domainName}
              onChange={(e) => updateFormData({ content: { ...formData.content, domainName: e.target.value } })}
            />
          </div>
        </FormSection>

        {/* Section 9: Admin Panel Needs */}
        <FormSection title={t.sections.admin.title} description={t.sections.admin.description}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox id="admin-sales" label={t.sections.admin.salesDashboard} checked={formData.admin.salesDashboard} onChange={(c) => updateFormData({ admin: { ...formData.admin, salesDashboard: c } })} />
            <Checkbox id="admin-cms" label={t.sections.admin.contentManagement} checked={formData.admin.contentManagement} onChange={(c) => updateFormData({ admin: { ...formData.admin, contentManagement: c } })} />
            <Checkbox id="admin-inventory" label={t.sections.admin.inventoryManagement} checked={formData.admin.inventoryManagement} onChange={(c) => updateFormData({ admin: { ...formData.admin, inventoryManagement: c } })} />
            <Checkbox id="admin-analytics" label={t.sections.admin.analytics} checked={formData.admin.analytics} onChange={(c) => updateFormData({ admin: { ...formData.admin, analytics: c } })} />
          </div>
        </FormSection>

        {/* Section 10: Additional Info */}
        <FormSection title={t.sections.additional.title} description={t.sections.additional.description}>
          <Textarea
            label={t.sections.additional.label}
            placeholder={t.sections.additional.placeholder}
            value={formData.additionalInfo}
            onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
            className="min-h-[120px]"
          />
        </FormSection>


        <div className="pt-8 border-t">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="mr-2" /> : t.form.submitButton}
          </Button>
          {submitError && <p className="text-red-500 text-center mt-4">{submitError}</p>}
        </div>
      </div>
    </div>
  );
}

function FormSection({ id, title, description, children }: { id?: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8">{children}</CardContent>
    </Card>
  );
}

function calculateProgress(data: ProjectBriefData): number {
  let completedFields = 0;
  const totalFields = 11;

  // Original fields
  if (data.summary.businessName) completedFields++;
  if (data.projectOverview.projectType) completedFields++;
  if (data.projectOverview.primaryGoal) completedFields++;
  if (data.aiFeatures.assistant) completedFields++;
  if (data.paymentMethods.currency) completedFields++;
  if (data.design.style) completedFields++;
  if (data.design.hasLogo !== null) completedFields++;

  // New fields
  if (data.projectOverview.budgetRange) completedFields++;
  if (data.projectOverview.deadline) completedFields++;
  if (data.projectOverview.targetAudience) completedFields++;
  if (data.content.hasPhotos) completedFields++;

  return (completedFields / totalFields) * 100;
}

// src/types/project-brief.ts

export interface ProjectBriefData {
  // 1. Project Overview (New/Thorough)
  projectOverview: {
    projectType:
      | "ecommerce"
      | "landing"
      | "portfolio"
      | "corporate"
      | "custom"
      | null;
    primaryGoal: string;
    targetAudience: string;
    deadline: string;
    budgetRange: string;
  };

  // 2. Payment Methods (Generalized)
  paymentMethods: {
    digitalWallet1: boolean; // e.g., Yape, Apple Pay
    digitalWallet2: boolean; // e.g., Plin, Google Pay
    bankTransfer: boolean;
    creditCard: boolean;
    accountDetails: string;
    currency: "PEN" | "USD" | "EUR" | "OTHER" | null;
  };

  // 3. AI Features (Generalized)
  aiFeatures: {
    assistant: "complete" | "simple" | "none" | null;
    imageGeneration: boolean;
    contentCreation: boolean;
    otherAI: string;
  };

  // 4. Customization & Features
  features: {
    userAccounts: boolean;
    bookingSystem: boolean;
    reviews: boolean;
    blog: boolean;
    multilingual: boolean;
    dedicatedSupport: boolean;
    responsiveDesign: boolean;
    seoOptimization: boolean;
  };

  // 5. Design & Brand
  design: {
    style:
      | "minimalist"
      | "vibrant"
      | "professional"
      | "luxury"
      | "custom"
      | null;
    hasLogo: boolean | null;
    brandColors: string;
    referenceWebsites: string;
  };

  // 6. Communication
  communication: {
    whatsappIntegration: boolean;
    emailMarketing: boolean;
    liveChat: boolean;
    contactForm: boolean;
  };

  // 7. Admin & Specific requirements
  admin: {
    salesDashboard: boolean;
    contentManagement: boolean;
    inventoryManagement: boolean;
    analytics: boolean;
  };

  // 8. Logistics (if applicable)
  logistics: {
    shippingIntegration: boolean;
    storePickup: boolean;
    localDelivery: boolean;
    zones: string;
  };

  // 9. Content & Materials
  content: {
    hasPhotos: "yes" | "no" | "some" | null;
    hasTextContent: boolean | null;
    hostingProvider: string;
    domainName: string;
  };

  // 10. Additional Info
  additionalInfo: string;

  // Summary for internal use
  summary: {
    businessName: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  };
}

export const initialProjectBriefData: ProjectBriefData = {
  projectOverview: {
    projectType: null,
    primaryGoal: "",
    targetAudience: "",
    deadline: "",
    budgetRange: "",
  },
  paymentMethods: {
    digitalWallet1: false,
    digitalWallet2: false,
    bankTransfer: false,
    creditCard: false,
    accountDetails: "",
    currency: null,
  },
  aiFeatures: {
    assistant: null,
    imageGeneration: false,
    contentCreation: false,
    otherAI: "",
  },
  features: {
    userAccounts: false,
    bookingSystem: false,
    reviews: false,
    blog: false,
    multilingual: false,
    dedicatedSupport: false,
    responsiveDesign: false,
    seoOptimization: false,
  },
  design: {
    style: null,
    hasLogo: null,
    brandColors: "",
    referenceWebsites: "",
  },
  communication: {
    whatsappIntegration: false,
    emailMarketing: false,
    liveChat: false,
    contactForm: false,
  },
  admin: {
    salesDashboard: false,
    contentManagement: false,
    inventoryManagement: false,
    analytics: false,
  },
  logistics: {
    shippingIntegration: false,
    storePickup: false,
    localDelivery: false,
    zones: "",
  },
  content: {
    hasPhotos: null,
    hasTextContent: null,
    hostingProvider: "",
    domainName: "",
  },
  additionalInfo: "",
  summary: {
    businessName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  },
};

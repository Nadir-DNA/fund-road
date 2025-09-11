interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  address?: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressLocality?: string;
  };
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    email?: string;
  };
}

interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  author: {
    "@type": "Person" | "Organization";
    name: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    priceCurrency: string;
    price: string;
    availability: string;
    url: string;
  };
}

// Helper functions to generate common schemas
export const createOrganizationSchema = (): OrganizationSchema => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fund Road",
  url: "https://fundroad.com",
  logo: "https://fundroad.com/logo.png",
  sameAs: [
    "https://linkedin.com/company/fundroad",
    "https://twitter.com/fundroad"
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
    addressLocality: "Paris"
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@fund-road.com"
  }
});

export const createWebSiteSchema = (): WebSiteSchema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Fund Road",
  url: "https://fundroad.com",
  description: "Plateforme d'accompagnement pour entrepreneurs - De l'idée au financement",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://fundroad.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const createArticleSchema = (
  title: string,
  description: string,
  publishDate: string,
  modifiedDate?: string,
  image?: string,
  url?: string
): ArticleSchema => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: description,
  author: {
    "@type": "Organization",
    name: "Fund Road"
  },
  publisher: {
    "@type": "Organization",
    name: "Fund Road",
    logo: {
      "@type": "ImageObject",
      url: "https://fundroad.com/logo.png"
    }
  },
  datePublished: publishDate,
  dateModified: modifiedDate || publishDate,
  image: image || "https://fundroad.com/og-default.jpg",
  url: url || window.location.href
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>): FAQSchema => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
});

export const createProductSchema = (
  name: string,
  description: string,
  price: string,
  currency: string = "EUR",
  availability: string = "https://schema.org/InStock"
): ProductSchema => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: name,
  description: description,
  brand: {
    "@type": "Brand",
    name: "Fund Road"
  },
  offers: {
    "@type": "Offer",
    priceCurrency: currency,
    price: price,
    availability: availability,
    url: window.location.href
  }
});
export interface HeroSlide {
  image: string
  alt: string
  label: string
  kicker: string
  title: string
  description: string
  emphasis: string
}

export interface SiteSettings {
  company: {
    name: string
    legalName: string
    tagline: string
    description: string
    phone: string
    phoneHref: string
    email: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
      full: string
      maps: string
    }
    hours: string
    coordinates: string
    serviceArea: string
    whatsapp: string
    whatsappMessage: string
  }
  socials: { linkedin: string, facebook: string, instagram: string, youtube: string, x: string }
  announcement: { enabled: boolean, text: string, linkLabel: string, linkUrl: string }
  hero: {
    eyebrow: string
    location: string
    titleLine1: string
    titleLine2: string
    emphasis: string
    rotating: string[]
    slides: HeroSlide[]
    subtitle: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
    badges: string[]
  }
  stats: { value: string, label: string, note: string }[]
  carousel: {
    enabled: boolean
    eyebrow: string
    title: string
    subtitle: string
    items: { image: string, alt: string, title: string, caption: string, label: string, credit?: string }[]
  }
  sections: Record<string, boolean>
  features: Record<string, boolean>
  quote: {
    projectTypes: string[]
    leadTimeRules: { projectType: string, maxQuantity: number, leadTime: string }[]
    defaultLeadTime: string
    reviewSlaHours: number
    autoReplySubject: string
    autoReplyBody: string
    requiredFields: string[]
  }
  plans: {
    slug: string
    name: string
    price: string
    period: string
    description: string
    features: string[]
    featured: boolean
    ctaLabel: string
  }[]
  seo: { titleSuffix: string, defaultTitle: string, defaultDescription: string, ogImage: string, twitterHandle: string }
  notifications: {
    recipients: string[]
    notifyOnQuote: boolean
    notifyOnContact: boolean
    notifyOnApplication: boolean
    sendCustomerAck: boolean
    fromName: string
    fromEmail: string
  }
  integrations: { ga4Id: string, metaPixelId: string, linkedinPartnerId: string, webhookUrl: string, calendarUrl: string }
  divisions: Record<string, { enabled: boolean, headline: string, lead: string }>
  services: Record<string, { enabled: boolean, lead: string }>
}

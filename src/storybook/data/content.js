/**
 * LAZARUS DEV — The Forest Between Pages
 * Stage 01 ONLY: editorial CONTENT DRAFT, not a frontend implementation.
 * Canonical narrative source: docs/forest/01-content-map.md
 * Existing-source baseline: main@e5edde4d2b1b5a0345432cc8e472905b1364e9d4
 *
 * Do not transform proposed outlines into published articles or conceptual
 * projects into commissioned case studies. No contact destination verified.
 */

export const storybookContent = {
  meta: {
    brand: "Lazarus Dev",
    language: "en",
    version: "stage-01-draft",
    description: "Independent creative development and digital product studio.",
    claimPolicy: "No fictional clients, awards, outcomes, shipped products, or published articles.",
    contactStatus: "unverified",
  },

  navigation: [
    { label: "Home", href: "#entrance" },
    { label: "Approach", href: "#winding-path" },
    { label: "Work", href: "#work-clearing" },
    { label: "Field Notes", href: "#river-stories" },
    { label: "Studio / Contact", href: "#house-on-the-hill" },
  ],

  quickAccess: [
    { label: "Skip to work", href: "#work-clearing" },
    { label: "Contact", href: "#house-on-the-hill" },
  ],

  chapters: [
    {
      id: "entrance",
      number: "01",
      name: "Entrance",
      informationJob: "Identify studio and scope immediately.",
      eyebrow: "LAZARUS DEV / INDEPENDENT CREATIVE DEVELOPMENT",
      heading: "Different worlds. Deliberate work.",
      lead: "We design and engineer distinctive websites, interactive experiences, and digital products for ideas that deserve their own world.",
      narrativeAside: "Every world begins somewhere.",
      actions: [
        { label: "Explore the work", kind: "anchor", href: "#work-clearing" },
        { label: "Follow the path", kind: "anchor", href: "#winding-path" },
      ],
      sceneHint: "Hand-drawn forest arch; Paperkeeper never obscures the real HTML heading or CTA.",
    },
    {
      id: "winding-path",
      number: "02",
      name: "Winding Path",
      informationJob: "Explain practices and distinguish service work from studio experiments.",
      eyebrow: "01 / THE PRACTICE",
      heading: "Every detail has a direction.",
      lead: "A memorable experience needs more than an unusual image. We shape the idea, design the interaction, and build the thing people actually use.",
      actions: [
        { label: "See what we make", kind: "anchor", href: "#work-clearing" },
      ],
      sceneHint: "A winding root path; no fictional achievements or forced scroll progress.",
    },
    {
      id: "work-clearing",
      number: "03",
      name: "Work Clearing",
      informationJob: "Show documented studio concepts with honest status labels.",
      eyebrow: "02 / SELECTED WORLDS",
      heading: "A clearing for ideas.",
      lead: "Some worlds begin as experiments. Others are built for people. Both deserve clarity about what they are.",
      notice: "Studio explorations / concept work — not client commissions.",
      actions: [
        { label: "Discover our approach", kind: "anchor", href: "#winding-path" },
      ],
      sceneHint: "Independent illustrated sheets hung in a clearing; no default three-card template.",
    },
    {
      id: "river-stories",
      number: "04",
      name: "River Stories",
      informationJob: "Show how the existing 3D work informs experimentation without pretending a journal is published.",
      eyebrow: "03 / FIELD NOTES",
      heading: "What happens between the lines.",
      lead: "Behind the finished image are sketches, wrong turns, experiments, and better questions.",
      publicationStatus: "draft-outlines-only",
      actions: [
        { label: "Explore the studio", kind: "anchor", href: "#house-on-the-hill" },
      ],
      sceneHint: "River and hand-drawn paper-shaped stones; no dead article links.",
    },
    {
      id: "house-on-the-hill",
      number: "05",
      name: "House on the Hill",
      informationJob: "Present independent studio philosophy and a truthful next step.",
      eyebrow: "04 / AN INDEPENDENT STUDIO",
      heading: "Small by choice. Wide in imagination.",
      lead: "Lazarus Dev takes on creative development work and explores digital products of its own. Each calls for curiosity, care, and the discipline to finish what matters.",
      manifesto: "We're not here to make more of the same. We build with intention, question the expected, and give the unusual a useful form.",
      actions: [
        { label: "Back to the beginning", kind: "anchor", href: "#entrance" },
      ],
      sceneHint: "A small cottage; studio identity is public, founder identities are not.",
    },
  ],

  businessTracks: [
    {
      id: "client-work",
      label: "Creative development for clients",
      evidenceStatus: "service-offering",
      note: "An offering, not proof of a named past commission.",
    },
    {
      id: "own-products",
      label: "Studio-led digital products",
      evidenceStatus: "studio-direction",
      note: "A direction, not a claim of launched products or customers.",
    },
  ],

  services: [
    {
      id: "creative-development",
      name: "Creative development",
      description: "Distinctive sites, refined interactions, cinematic frontends.",
      origin: "existing-index",
    },
    {
      id: "digital-products",
      name: "Digital products",
      description: "Scalable platforms and tools designed for real use.",
      origin: "existing-index",
    },
    {
      id: "immersive-experiences",
      name: "Immersive experiences",
      description: "WebGL, motion systems, and worlds that respond to you.",
      origin: "existing-index",
    },
    {
      id: "independent-experiments",
      name: "Independent experiments",
      description: "Our own ideas, crafted beyond the boundaries of a brief.",
      origin: "existing-index",
    },
  ],

  proposedProcess: {
    status: "editorial-proposal-not-verified-historical-workflow",
    steps: ["Discover", "Define", "Make", "Refine"],
  },

  projects: [
    {
      id: "the-atrium",
      title: "THE ATRIUM",
      kind: "experience-concept",
      label: "Experience concept",
      status: "concept-not-client-commission",
      caption: "A place for the beautifully impossible.",
      description: "A conceptual destination for art and architecture. Monumental portals transform navigation into an act of discovery, while carefully staged light and typography make each interaction feel considered.",
      href: null,
      origin: "existing-index-and-src-main",
    },
    {
      id: "the-oracle",
      title: "THE ORACLE",
      kind: "product-exploration",
      label: "Product exploration",
      status: "concept-not-client-commission",
      caption: "Intelligence, with a sense of wonder.",
      description: "An experimental interface for human-centered intelligence. Information becomes a constellation of connected ideas, guiding people toward understanding without reducing complexity to a dashboard.",
      href: null,
      origin: "existing-index-and-src-main",
    },
    {
      id: "the-archive",
      title: "THE ARCHIVE",
      kind: "editorial-exploration",
      label: "Editorial exploration",
      status: "concept-not-client-commission",
      caption: "A digital monument to ideas.",
      description: "An editorial concept for culture, ideas, and memory. A digital library envisioned as a monumental place rather than an endless feed, where reading feels like exploration.",
      href: null,
      origin: "existing-index-and-src-main",
    },
  ],

  futurePortfolioCandidates: [
    {
      title: "Lazarus Dev — The Rupture",
      category: "Studio-built technical demonstration",
      source: "existing-3d-site",
      status: "review-before-publication",
      note: "The existing 3D website is a demonstrable studio build, not a client commission. Add to public Work only with truthful details and a real destination.",
    },
  ],

  editorialOutlines: [
    {
      title: "Building the impossible portal",
      topic: "Design and implementation of the existing interactive 3D world.",
      status: "unpublished-outline",
      href: null,
    },
    {
      title: "Material makes the mood",
      topic: "Photographic stone materials, lighting, and atmosphere in the existing 3D site.",
      status: "unpublished-outline",
      href: null,
    },
  ],

  contact: {
    channelVerified: false,
    externalHref: null,
    heading: "Tell us what you imagine.",
    draftActionLabel: "Prepare a project brief",
    draftActionKind: "future-copy-only-interaction",
    userDisclosure: "Your brief is copied to your device. It is not sent to Lazarus Dev.",
    requiredBeforeSending: "A verified inbox, form endpoint, or other owner-approved contact channel.",
    note: "Do not render the draftAction as an inert clickable button before Stage 13 implements the real interaction.",
  },

  footer: {
    quickLinks: [
      { label: "Approach", href: "#winding-path" },
      { label: "Work", href: "#work-clearing" },
      { label: "Field Notes", href: "#river-stories" },
      { label: "Contact", href: "#house-on-the-hill" },
    ],
    backToStart: { label: "Back to the beginning", href: "#entrance" },
    credit: "Independent by design.",
  },
};

export default storybookContent;

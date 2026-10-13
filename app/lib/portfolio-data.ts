export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
};

export type PortfolioContact = {
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

export const portfolioData = {
  profile: {
    name: 'Somto Wisdom',
    initials: 'SW',
    badge: "Hi, I'm",
    headline: 'I build modern websites that feel fast on every screen.',
    intro:
      "I'm a front-end developer and UI/UX enthusiast who turns ideas into clean, responsive, and user-friendly web experiences.",
    role: 'Web Developer',
    stack: 'React, Next.js, TypeScript, and responsive UI systems',
    photo: '/IMG_20261003_171747_354 (1).png',
    email: 'somtookafor652@gmail.com',
    phone: '08147028641',
    phoneHref: 'tel:+2348147028641',
    whatsapp: 'https://wa.me/qr/IML4ODBEPO32F1',
    instagram:
      'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=avb56mr',
    github: '',
    linkedin: '',
    twitter: '',
    behance: '',
    cvLink: '',
  },
  about: {
    text:
      "I'm a passionate developer with a strong interest in creating intuitive and visually polished experiences. I enjoy solving real problems, learning new technologies, and building interfaces that stay reliable from mobile phones to desktop displays.",
    points: [
      'Responsive layouts built mobile-first',
      'Clean and maintainable front-end code',
      'User-centered design decisions',
    ],
    stats: [
      { value: '3+', label: 'Years of experience' },
      { value: '20+', label: 'Projects completed' },
      { value: '10+', label: 'Happy clients' },
    ],
  },
  services: [
    {
      title: 'Website design',
      text: 'Clean, modern layouts that match your brand and stay easy to use.',
    },
    {
      title: 'Front-end development',
      text: 'Responsive interfaces built for speed, accessibility, and maintainability.',
    },
    {
      title: 'Landing pages',
      text: 'High-converting pages with clear messaging and strong calls to action.',
    },
    {
      title: 'Dashboards and web apps',
      text: 'Interactive interfaces with structured content, forms, and clear navigation.',
    },
  ],
  projects: [
    {
      id: 'sarvoraa',
      title: 'Sarvoraa Food Ordering',
      description:
        'A modern food-ordering landing page with a menu selector, clear hierarchy, and a polished dark theme.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: '/web food.webp',
      link: '',
    },
    {
      id: 'bitcoin',
      title: 'Bitcoin Landing Page',
      description:
        'A sleek crypto landing page with strong contrast, market-style cards, and clear calls to action.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: '/bitcoin.webp',
      link: '',
    },
    {
      id: 'game-shelf',
      title: 'Game Shelf',
      description:
        'A games showcase experience built as a clean grid of cards with imagery, labels, and CTA buttons.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: '/gameing.jpg',
      link: '',
    },
  ] satisfies PortfolioProject[],
  skills: [
    'HTML5',
    'CSS3',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Tailwind CSS',
    'Responsive Design',
    'Git',
    'UI/UX Design',
  ],
  contacts: [
    {
      label: 'Call or text',
      value: '08147028641',
      href: 'tel:+2348147028641',
    },
    {
      label: 'Email',
      value: 'somtookafor652@gmail.com',
      href: 'mailto:somtookafor652@gmail.com',
    },
    {
      label: 'WhatsApp',
      value: 'Chat with me',
      href: 'https://wa.me/qr/IML4ODBEPO32F1',
      external: true,
    },
    {
      label: 'Instagram',
      value: 'Follow my work',
      href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=avb56mr',
      external: true,
    },
  ] satisfies PortfolioContact[],
  cta: {
    title: 'Have a project in mind?',
    text: "I'm open to new opportunities, collaborations, and product ideas that need a polished web presence.",
  },
};

export type PortfolioData = typeof portfolioData;

export type ProjectStatus = 'Ongoing' | 'Completed' | 'Planned';

export type Project = {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  duration: string;
  researchers: number;
  area: string;
  imageSrc: string;
  /** Optional sub/gallery images shown on the detail page (e.g. for project 4) */
  subImages?: string[];
};

export const projects: Project[] = [
  {
    id: 1,
    title: 'Smart Grid Implementation for Rural Electrification',
    description:
      'Developing intelligent grid systems to improve electricity access in rural communities.',
    status: 'Ongoing',
    duration: '2023–2026',
    researchers: 12,
    area: 'Power Systems',
    imageSrc: '/images/lab.jpg',
    subImages: ['/images/slide2.jpg', '/images/slide3.jpg', '/images/news/1.jpg'],
  },
  {
    id: 2,
    title: 'Solar-Powered Microgrids for Off-Grid Communities',
    description:
      'Designing and deploying sustainable microgrid solutions for remote areas.',
    status: 'Ongoing',
    duration: '2024–2027',
    researchers: 8,
    area: 'Renewables',
    imageSrc: '/images/slide2.jpg',
    subImages: ['/images/lab.jpg', '/images/slide3.jpg', '/images/news/2.jpg'],
  },
  {
    id: 3,
    title: 'Advanced Battery Storage Systems',
    description:
      'Research on next-generation battery technologies for renewable energy storage.',
    status: 'Ongoing',
    duration: '2023–2026',
    researchers: 15,
    area: 'Energy Storage',
    imageSrc: '/images/slide3.jpg',
    subImages: ['/images/lab.jpg', '/images/slide2.jpg', '/images/news/3.jpg'],
  },
  {
    id: 4,
    title: 'Energy Policy & Demand Forecasting Toolkit',
    description:
      'A practical toolkit for demand forecasting, scenario planning, and policy evaluation.',
    status: 'Planned',
    duration: '2026–2028',
    researchers: 6,
    area: 'Energy Policy',
    imageSrc: '/images/news/1.jpg',
    subImages: ['/images/news/2.jpg', '/images/news/3.jpg', '/images/lab.jpg'],
  },
];

export function getProjectById(id: number | string): Project | undefined {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) return undefined;
  return projects.find((p) => p.id === numId);
}

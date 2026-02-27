const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test projects with access codes...\n');

  // Create projects with access code "TEAM-A"
  const teamAProjects = [
    {
      title: 'Smart Grid Implementation for Rural Areas',
      description: 'Developing intelligent grid systems to improve electricity access in rural communities across Nigeria.',
      lead: 'Dr. Sarah Johnson',
      dueDate: new Date('2026-12-31'),
      images: ['/images/lab.jpg', '/images/slide2.jpg'],
      accessCode: 'TEAM-A',
    },
    {
      title: 'Solar-Powered Microgrids Research',
      description: 'Designing and deploying sustainable microgrid solutions for remote areas.',
      lead: 'Prof. Michael Chen',
      dueDate: new Date('2026-06-30'),
      images: ['/images/slide2.jpg', '/images/slide3.jpg'],
      accessCode: 'TEAM-A',
    },
  ];

  // Create projects with access code "TEAM-B"
  const teamBProjects = [
    {
      title: 'Advanced Battery Storage Systems',
      description: 'Research on next-generation battery technologies for renewable energy storage.',
      lead: 'Dr. Aisha Ibrahim',
      dueDate: new Date('2027-03-15'),
      images: ['/images/slide3.jpg', '/images/lab.jpg'],
      accessCode: 'TEAM-B',
    },
    {
      title: 'Energy Policy & Demand Forecasting',
      description: 'A practical toolkit for demand forecasting, scenario planning, and policy evaluation.',
      lead: 'Dr. Emmanuel Okafor',
      dueDate: new Date('2026-09-30'),
      images: ['/images/news/1.jpg', '/images/news/2.jpg'],
      accessCode: 'TEAM-B',
    },
  ];

  // Create projects with access code "INNOVATION"
  const innovationProjects = [
    {
      title: 'AI-Powered Energy Management Platform',
      description: 'Machine learning platform for optimizing energy distribution and consumption patterns.',
      lead: 'Dr. Chioma Eze',
      dueDate: new Date('2027-01-31'),
      images: ['/images/lab.jpg'],
      accessCode: 'INNOVATION',
    },
    {
      title: 'Blockchain for Energy Trading',
      description: 'Decentralized platform for peer-to-peer renewable energy trading.',
      lead: 'Eng. Tunde Williams',
      dueDate: new Date('2026-11-30'),
      images: ['/images/slide2.jpg'],
      accessCode: 'INNOVATION',
    },
    {
      title: 'IoT Sensors for Grid Monitoring',
      description: 'Development of low-cost IoT devices for real-time power grid monitoring and fault detection.',
      lead: 'Dr. Grace Adebayo',
      dueDate: new Date('2026-08-15'),
      images: ['/images/slide3.jpg'],
      accessCode: 'INNOVATION',
    },
  ];

  // Create projects WITHOUT access codes (public projects)
  const publicProjects = [
    {
      title: 'Public Renewable Energy Education Initiative',
      description: 'Community outreach program to educate citizens about renewable energy benefits.',
      lead: 'Prof. James Obi',
      dueDate: new Date('2026-12-31'),
      images: ['/images/news/1.jpg'],
      accessCode: null,
    },
  ];

  // Insert all projects
  const allProjects = [
    ...teamAProjects,
    ...teamBProjects,
    ...innovationProjects,
    ...publicProjects,
  ];

  for (const project of allProjects) {
    const created = await prisma.project.create({
      data: project,
    });
    console.log(`✅ Created: "${created.title}" (Code: ${created.accessCode || 'None'})`);
  }

  console.log('\n✨ Successfully seeded test projects!\n');
  console.log('📋 Test Access Codes:');
  console.log('   - TEAM-A (2 projects)');
  console.log('   - TEAM-B (2 projects)');
  console.log('   - INNOVATION (3 projects)');
  console.log('   - No code (1 public project)\n');
  console.log('🧪 To test the feature:');
  console.log('   1. Visit http://localhost:3000/projects');
  console.log('   2. Enter one of the access codes above');
  console.log('   3. You should see only projects with matching access codes\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding projects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// ACE-SPED Knowledge Base
// Comprehensive information about Africa Centre of Excellence for Sustainable Power and Energy Development

export interface KnowledgeEntry {
  keywords: string[];
  category: string;
  answer: string;
  relatedTopics?: string[];
}

export const aceSpedKnowledge: KnowledgeEntry[] = [
  // About ACE-SPED
  {
    keywords: ['what is ace-sped', 'about ace-sped', 'ace-sped meaning', 'what does ace-sped stand for'],
    category: 'About',
    answer: `ACE-SPED stands for Africa Centre of Excellence for Sustainable Power and Energy Development. It is a World Bank assisted project domiciled at the University of Nigeria, Nsukka. The Centre was conceptualized to proffer sustainable solutions to some developmental challenges peculiar to the Sub-Saharan Africa region.

The fundamental aim of ACE-SPED is to carry out impactful educational research, development, and training activities that address critical energy challenges while building capacity for sustainable development across the continent.

Our motto is: "Dignity through Sustainable Power and Energy"`,
    relatedTopics: ['mission', 'vision', 'thematic areas', 'programs']
  },
  {
    keywords: ['mission', 'what is the mission', 'mission statement'],
    category: 'About',
    answer: `Our Mission is to create a functional, problem-solving Center of Excellence with the capacity to impact meaningfully in power systems and energy development, through knowledge transfer and human capital upgrade.`,
    relatedTopics: ['vision', 'about ace-sped', 'values']
  },
  {
    keywords: ['vision', 'what is the vision', 'vision statement'],
    category: 'About',
    answer: `Our Vision is to establish a regional hub, focused on addressing the energy and power challenges of sub-saharan Africa through research, education, and collaboration with sectoral partners.`,
    relatedTopics: ['mission', 'about ace-sped', 'values']
  },
  {
    keywords: ['location', 'where is ace-sped', 'address', 'location of ace-sped'],
    category: 'Contact',
    answer: `ACE-SPED is located at:
University of Nigeria, Nsukka
Enugu State, Nigeria

Email: info@ace-sped.unn.edu.ng
Phone: +234 (0) 803 XXX XXXX`,
    relatedTopics: ['contact', 'visit', 'email', 'phone']
  },
  {
    keywords: ['contact', 'how to contact', 'email', 'phone number', 'reach us'],
    category: 'Contact',
    answer: `You can contact ACE-SPED through:

Email: info@ace-sped.unn.edu.ng
Phone: +234 (0) 803 XXX XXXX
Address: ACE-SPED, University of Nigeria, Nsukka, Enugu State, Nigeria

You can also visit our Contact page on the website for more information or to send us a message.`,
    relatedTopics: ['location', 'address', 'email', 'phone']
  },

  // Thematic Areas
  {
    keywords: ['thematic areas', 'research areas', 'focus areas', 'what are the thematic areas'],
    category: 'Research',
    answer: `ACE-SPED focuses on five major thematic areas:

1. **Electric Power Systems Development** - Advanced research and development in power generation, transmission, and distribution systems

2. **Renewable Energy, Waste-to-Energy and Energy Conservation** - Innovation in sustainable energy sources including solar, wind, hydro, and waste-to-energy technologies

3. **Energy Resources Assessment and Forecasting** - Comprehensive analysis and prediction of energy resources, consumption patterns, and future trends

4. **Sustainable Energy Materials** - Development of advanced materials for energy conversion, storage, and sustainable applications

5. **Energy Policy, Regulation and Management** - Research in energy economics, policy formulation, regulatory frameworks, and strategic management`,
    relatedTopics: ['programs', 'research', 'laboratories']
  },
  {
    keywords: ['electric power systems', 'power systems development'],
    category: 'Research',
    answer: `Electric Power Systems Development is one of our five thematic areas. This area focuses on advanced research and development in power generation, transmission, and distribution systems. Research includes power system stability and control, fault analysis and protection, grid integration of renewable energy, smart grid technologies, and power quality improvement.`,
    relatedTopics: ['thematic areas', 'power systems laboratory', 'programs']
  },
  {
    keywords: ['renewable energy', 'solar', 'wind', 'hydro', 'waste to energy'],
    category: 'Research',
    answer: `Renewable Energy, Waste-to-Energy and Energy Conservation is a key thematic area at ACE-SPED. We focus on innovation in sustainable energy sources including:
- Solar photovoltaic systems
- Wind energy conversion
- Hydroelectric power
- Waste-to-energy processes
- Energy storage solutions

Our Renewable Energy Laboratory is equipped with solar panel test benches, wind turbine simulators, battery storage systems, and more.`,
    relatedTopics: ['thematic areas', 'renewable energy laboratory', 'programs']
  },
  {
    keywords: ['energy materials', 'sustainable materials', 'battery', 'energy storage'],
    category: 'Research',
    answer: `Sustainable Energy Materials is a thematic area focusing on development of advanced materials for energy conversion, storage, and sustainable applications. Research includes:
- Battery materials development
- Supercapacitor materials
- Fuel cell technologies
- Nanomaterials for energy
- Sustainable material synthesis

Our Energy Materials Laboratory has electrochemical workstations, material characterization tools, battery testing systems, and more.`,
    relatedTopics: ['thematic areas', 'energy materials laboratory', 'programs']
  },

  // Programs
  {
    keywords: ['programs', 'what programs', 'available programs', 'courses', 'what courses'],
    category: 'Programs',
    answer: `ACE-SPED offers several comprehensive programs:

1. **ACE-SPED M.Eng/M.Sc and Ph.D. Programs** - Graduate programs with 9+ courses covering 5 thematic areas. Duration: 2-5 years. Fees: ₦350,000 - ₦500,000 per session.

2. **ACE-SPED Innovation, Vocational & Entrepreneurship Training (IVET-HUB)** - 10 certificate programs including Full Stack Web Development, Data Analysis, Cyber Security, Mobile App Development, and more. Duration: 3-6 months. Fees: ₦50,000 - ₦150,000 per course.

3. **ACE-SPED C-Code Studio** - 5 media programs including Video Editing, Podcast Production, Content Creation, Motion Graphics, and Photography. Duration: 2-4 months. Fees: ₦40,000 - ₦100,000 per course.

4. **Sales & Repairs of Gadgets** - Technical training and services including laptop repair, printer repair, computer accessories, and more. Duration: 3-6 months training. Fees: ₦30,000 - ₦80,000 per course.`,
    relatedTopics: ['admission', 'application', 'fees', 'graduate programs', 'ivet-hub']
  },
  {
    keywords: ['graduate programs', 'm.eng', 'm.sc', 'phd', 'masters', 'doctoral'],
    category: 'Programs',
    answer: `ACE-SPED offers M.Eng/M.Sc and Ph.D. Programs in various fields:

**Programs Include:**
- M.Eng/M.Sc in Electric Power Systems Development
- M.Eng/M.Sc in Renewable Energy Systems
- M.Eng/M.Sc in Sustainable Energy Materials
- Ph.D. in Sustainable Power and Energy Development
- And more...

**Duration:**
- Masters: 18-24 months
- PhD: 3-5 years

**Fees:** ₦350,000 - ₦500,000 per session

**Study Mode:** Full-time / Part-time

These programs cover all five thematic areas and provide comprehensive training in sustainable power and energy development.`,
    relatedTopics: ['programs', 'admission', 'application', 'fees']
  },
  {
    keywords: ['ivet-hub', 'ivet hub', 'vocational training', 'certificate programs'],
    category: 'Programs',
    answer: `ACE-SPED Innovation, Vocational & Entrepreneurship Training (IVET-HUB) offers 10 certificate programs:

1. Full Stack Web Development
2. Data Analysis & Visualization
3. Cyber Security Fundamentals
4. Mobile App Development
5. Digital Marketing
6. UI/UX Design
7. Cloud Computing
8. Artificial Intelligence & Machine Learning
9. Database Management
10. DevOps Engineering

**Duration:** 3-6 months
**Fees:** ₦50,000 - ₦150,000 per course
**Study Mode:** Full-time / Part-time / Online`,
    relatedTopics: ['programs', 'application', 'fees', 'courses']
  },
  {
    keywords: ['c-code studio', 'c code studio', 'media programs', 'video editing', 'photography'],
    category: 'Programs',
    answer: `ACE-SPED C-Code Studio offers 5 media programs:

1. Professional Video Editing (Adobe Premiere Pro)
2. Podcast Production & Audio Engineering
3. Social Media Content Creation
4. Motion Graphics & Animation
5. Photography & Photo Editing

**Duration:** 2-4 months
**Fees:** ₦40,000 - ₦100,000 per course
**Study Mode:** Full-time / Part-time / Workshop`,
    relatedTopics: ['programs', 'application', 'fees']
  },

  // Admission
  {
    keywords: ['admission', 'how to apply', 'application', 'apply', 'admission process'],
    category: 'Admission',
    answer: `To apply for admission at ACE-SPED:

1. Visit our Application portal on the website
2. Complete the multi-step application form which includes:
   - Personal Information
   - Next of Kin Information
   - Program Selection
   - Educational Background
   - Employment Details
   - Research Proposal (for graduate programs)
   - Recommendations
   - Payment Information

3. Submit required documents
4. Pay the application fee
5. Wait for admission decision

You can access the application portal from the "Application" button on our website or through the "Admission" menu.`,
    relatedTopics: ['programs', 'requirements', 'fees', 'admission list']
  },
  {
    keywords: ['admission requirements', 'requirements', 'entry requirements', 'what do i need'],
    category: 'Admission',
    answer: `Admission requirements vary by program:

**For Graduate Programs (M.Eng/M.Sc):**
- Bachelor's degree in Engineering or related field (minimum 2nd Class Upper)
- Strong background in mathematics and physics
- Two academic references
- Research proposal (for PhD applicants)

**For IVET-HUB Certificate Programs:**
- Basic computer literacy
- Interest in the chosen field
- No formal degree required for most programs

**For C-Code Studio:**
- Interest in media and creative fields
- Basic computer skills

Please check the specific program page for detailed requirements.`,
    relatedTopics: ['admission', 'application', 'programs']
  },
  {
    keywords: ['admission list', 'check admission', 'admission status', 'admission letter'],
    category: 'Admission',
    answer: `You can check your admission status and access your admission letter through:

1. **Admission List** - Visit the "Admission List" page to see published admission lists
2. **Accept Admission** - If admitted, visit the "Accept Admission" page to accept your offer
3. **Admission Letter** - Download your admission letter from the "Admission Letter" page

All these can be accessed from the "Admission" menu on our website.`,
    relatedTopics: ['admission', 'application', 'accept admission']
  },
  {
    keywords: ['fees', 'tuition', 'cost', 'price', 'how much'],
    category: 'Admission',
    answer: `Fee structure at ACE-SPED:

**Graduate Programs (M.Eng/M.Sc/Ph.D):**
- ₦350,000 - ₦500,000 per session

**IVET-HUB Certificate Programs:**
- ₦50,000 - ₦150,000 per course

**C-Code Studio Programs:**
- ₦40,000 - ₦100,000 per course

**Sales & Repairs Training:**
- ₦30,000 - ₦80,000 per course

Application fees and other charges may apply. Please check the specific program page for detailed fee information.`,
    relatedTopics: ['admission', 'programs', 'payment']
  },

  // Laboratories
  {
    keywords: ['laboratories', 'labs', 'research facilities', 'lab facilities'],
    category: 'Laboratories',
    answer: `ACE-SPED has 6+ world-class laboratories:

1. **Power Systems Laboratory** - Power system simulators, high-voltage testing equipment, protection relay test sets
2. **Renewable Energy Laboratory** - Solar panel test benches, wind turbine simulators, battery storage systems
3. **Energy Materials Laboratory** - Electrochemical workstations, material characterization tools, battery testing systems
4. **Energy Assessment & Forecasting Lab** - Energy monitoring systems, data acquisition systems, high-performance computing
5. **Smart Grid & Control Laboratory** - Smart grid simulators, SCADA systems, IoT sensors
6. **Power Electronics Laboratory** - Power electronics test benches, oscilloscopes, prototyping equipment

All laboratories are equipped with modern equipment and are accessible to students and researchers.`,
    relatedTopics: ['research', 'thematic areas', 'facilities']
  },
  {
    keywords: ['lab access', 'book laboratory', 'lab booking', 'use laboratory'],
    category: 'Laboratories',
    answer: `Laboratory Access Information:

**Operating Hours:**
- Monday - Friday: 8:00 AM - 6:00 PM
- Saturday: 9:00 AM - 2:00 PM

**Access Requirements:**
- Valid student ID or staff identification required
- Safety training certification for certain laboratories

**Contact:**
- Phone: +234 803 923 3432
- Email: labs@acespedunn.edu.ng
- Location: ACE-SPED Building, UNN Campus

You can request laboratory access through the application portal or contact the laboratory services directly.`,
    relatedTopics: ['laboratories', 'contact', 'research']
  },

  // Research
  {
    keywords: ['research', 'research projects', 'research opportunities'],
    category: 'Research',
    answer: `ACE-SPED conducts cutting-edge research across all five thematic areas:

- **500+ Research Projects** completed
- Research in power systems, renewable energy, energy materials, policy, and more
- Collaboration with industry partners and international organizations
- State-of-the-art laboratories supporting research
- Publications in international journals

Research opportunities are available for graduate students, faculty, and visiting researchers. Visit our Research page for more information.`,
    relatedTopics: ['thematic areas', 'laboratories', 'programs']
  },

  // Statistics
  {
    keywords: ['statistics', 'stats', 'numbers', 'how many students', 'achievements'],
    category: 'About',
    answer: `ACE-SPED Achievements:

- **25,000+** Students Enrolled
- **1,200+** Expert Faculty
- **500+** Research Projects
- **150+** Global Partners
- **6+** World-Class Laboratories
- **200+** Equipment Units

These numbers reflect our commitment to excellence in education, research, and innovation in sustainable power and energy development.`,
    relatedTopics: ['about ace-sped', 'programs', 'research']
  },

  // Values
  {
    keywords: ['values', 'core values', 'principles'],
    category: 'About',
    answer: `ACE-SPED Core Values:

1. **Excellence** - Commitment to the highest standards in education, research, and innovation
2. **Innovation** - Fostering creativity and cutting-edge solutions to energy challenges
3. **Sustainability** - Promoting sustainable practices and solutions for future generations
4. **Collaboration** - Building partnerships with industry, government, and international organizations
5. **Impact** - Creating meaningful change in Sub-Saharan Africa and beyond
6. **Integrity** - Maintaining ethical standards and transparency in all activities`,
    relatedTopics: ['mission', 'vision', 'about ace-sped']
  },

  // Services
  {
    keywords: ['services', 'what services', 'available services'],
    category: 'Services',
    answer: `ACE-SPED offers various services including:

- Academic Programs (Graduate and Certificate)
- Research Facilities and Laboratories
- Training Programs (IVET-HUB, C-Code Studio)
- Technical Services (Sales & Repairs of Gadgets)
- Consultation Services
- Industry Partnerships

Visit our Services page to explore all available services and programs.`,
    relatedTopics: ['programs', 'admission', 'application']
  },

  // Student Accommodation
  {
    keywords: ['accommodation', 'hostel', 'housing', 'residence', 'dormitory', 'where to stay', 'where can i live', 'student housing', 'on-campus housing', 'off-campus', 'rental', 'lodging', 'place to stay'],
    category: 'Student Services',
    answer: `We provide quite affordable and clean accommodation in our school in partnership with University of Nigeria Nsukka.

All new ACE-SPED students who are willing to reside within the school environment are guaranteed a safe and clean hostel in the school. If you require off-campus accommodation, this is organised through Students' Union, who will help you find recommended rental spaces across the city.`,
    relatedTopics: ['admission', 'contact', 'student services']
  },

  // General Help
  {
    keywords: ['help', 'assistance', 'support'],
    category: 'General',
    answer: `I can help you with information about:

- ACE-SPED overview, mission, and vision
- Programs and courses (Graduate, IVET-HUB, C-Code Studio)
- Admission process and requirements
- Fees and payment
- Laboratories and research facilities
- Thematic areas and research
- Contact information
- Services offered
- Student accommodation

What would you like to know more about?`,
    relatedTopics: ['about ace-sped', 'programs', 'admission', 'contact']
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    category: 'General',
    answer: `Hello! Welcome to ACE-SPED (Africa Centre of Excellence for Sustainable Power and Energy Development). I'm here to help you with information about our programs, admission, research, laboratories, and more. How can I assist you today?`,
    relatedTopics: ['help', 'about ace-sped', 'programs']
  }
];

// Function to find relevant knowledge entries based on user query
export function findRelevantKnowledge(query: string): KnowledgeEntry[] {
  try {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) return [];

    if (!aceSpedKnowledge || !Array.isArray(aceSpedKnowledge)) {
      console.error('Knowledge base is not properly initialized');
      return [];
    }

    // Score each knowledge entry based on keyword matches
    const scoredEntries = aceSpedKnowledge.map(entry => {
      if (!entry || !entry.keywords || !Array.isArray(entry.keywords)) {
        return { entry, score: 0 };
      }

      let score = 0;
      
      // Check for exact keyword matches
      entry.keywords.forEach(keyword => {
        if (typeof keyword === 'string') {
          const lowerKeyword = keyword.toLowerCase();
          if (lowerQuery.includes(lowerKeyword) || lowerKeyword.includes(lowerQuery)) {
            score += 2; // Higher weight for keyword matches
          }
        }
      });

      // Check for partial matches in answer
      if (entry.answer && typeof entry.answer === 'string') {
        const lowerAnswer = entry.answer.toLowerCase();
        const queryWords = lowerQuery.split(/\s+/);
        queryWords.forEach(word => {
          if (word.length > 2 && lowerAnswer.includes(word)) {
            score += 1;
          }
        });
      }

      return { entry, score };
    });

    // Filter and sort by score
    return scoredEntries
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Return top 3 matches
      .map(item => item.entry);
  } catch (error) {
    console.error('Error in findRelevantKnowledge:', error);
    return [];
  }
}

// Function to generate a comprehensive answer from knowledge entries
export function generateAnswer(query: string, entries: KnowledgeEntry[]): string {
  try {
    if (!entries || entries.length === 0) {
      return `I can help you with information about ACE-SPED. Here are some topics I can assist with:

- Programs and courses (Graduate, IVET-HUB, C-Code Studio)
- Admission process and requirements
- Research and laboratories
- Contact information
- Student services and accommodation

Could you please rephrase your question or ask about one of these topics?`;
    }

    // Use the top match
    const topEntry = entries[0];
    if (!topEntry || !topEntry.answer) {
      return `I can help you with information about ACE-SPED. What would you like to know?`;
    }

    let answer = topEntry.answer;

    // If there are related topics, mention them
    if (topEntry.relatedTopics && Array.isArray(topEntry.relatedTopics) && topEntry.relatedTopics.length > 0) {
      answer += `\n\nYou might also be interested in: ${topEntry.relatedTopics.slice(0, 3).join(', ')}.`;
    }

    return answer;
  } catch (error) {
    console.error('Error in generateAnswer:', error);
    return `I can help you with information about ACE-SPED. What would you like to know?`;
  }
}


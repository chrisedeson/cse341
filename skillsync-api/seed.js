const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
require('dotenv').config();

const users = [
  {
    name: 'John Developer',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Full-stack developer with 5 years of experience',
    experienceLevel: 'mid',
    skills: [
      { name: 'JavaScript', level: 'advanced', yearsOfExperience: 5 },
      { name: 'React', level: 'advanced', yearsOfExperience: 4 },
      { name: 'Node.js', level: 'intermediate', yearsOfExperience: 3 },
      { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 3 }
    ],
    location: 'San Francisco, CA',
    isAvailable: true,
    preferredProjectTypes: ['web-development'],
    hourlyRate: 75,
    languages: ['english'],
    timezone: 'PST'
  },
  {
    name: 'Sarah Designer',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'UI/UX designer passionate about creating beautiful user experiences',
    experienceLevel: 'senior',
    skills: [
      { name: 'Figma', level: 'expert', yearsOfExperience: 6 },
      { name: 'Adobe XD', level: 'advanced', yearsOfExperience: 4 },
      { name: 'Sketch', level: 'intermediate', yearsOfExperience: 2 }
    ],
    location: 'New York, NY',
    isAvailable: true,
    preferredProjectTypes: ['web-development', 'mobile-development'],
    hourlyRate: 80,
    languages: ['english', 'spanish'],
    timezone: 'EST'
  },
  {
    name: 'Mike Backend',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'Backend specialist with expertise in scalable systems',
    experienceLevel: 'senior',
    skills: [
      { name: 'Python', level: 'expert', yearsOfExperience: 7 },
      { name: 'Django', level: 'expert', yearsOfExperience: 6 },
      { name: 'PostgreSQL', level: 'advanced', yearsOfExperience: 5 },
      { name: 'AWS', level: 'advanced', yearsOfExperience: 4 }
    ],
    location: 'Austin, TX',
    isAvailable: true,
    preferredProjectTypes: ['web-development', 'data-science'],
    hourlyRate: 90,
    languages: ['english'],
    timezone: 'CST'
  }
];

const projects = [
  {
    title: 'E-commerce Platform',
    description: 'Build a modern e-commerce platform with React frontend and Node.js backend. Features include user authentication, product catalog, shopping cart, and payment integration.',
    shortDescription: 'Modern e-commerce platform with full-stack implementation',
    category: 'web-development',
    status: 'open',
    requiredSkills: [
      { name: 'React', level: 'intermediate', isRequired: true },
      { name: 'Node.js', level: 'intermediate', isRequired: true },
      { name: 'MongoDB', level: 'beginner', isRequired: false },
      { name: 'Stripe API', level: 'beginner', isRequired: false }
    ],
    maxTeamSize: 4,
    budget: {
      min: 5000,
      max: 15000,
      currency: 'USD'
    },
    timeline: {
      estimatedDuration: 12
    },
    difficulty: 'intermediate',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    tags: ['e-commerce', 'full-stack', 'payment-integration'],
    isRemote: true,
    communication: {
      platform: 'slack',
      frequency: 'weekly'
    },
    requirements: 'Experience with React hooks, REST APIs, and database design preferred.',
    benefits: 'Opportunity to work on a real-world project and build portfolio piece.'
  },
  {
    title: 'Mobile Fitness App',
    description: 'Develop a cross-platform mobile fitness application with workout tracking, nutrition logging, and social features. Target audience is health-conscious individuals aged 18-45.',
    shortDescription: 'Cross-platform fitness app with tracking and social features',
    category: 'mobile-development',
    status: 'open',
    requiredSkills: [
      { name: 'React Native', level: 'intermediate', isRequired: true },
      { name: 'Firebase', level: 'intermediate', isRequired: true },
      { name: 'Figma', level: 'beginner', isRequired: false }
    ],
    maxTeamSize: 3,
    budget: {
      min: 8000,
      max: 20000,
      currency: 'USD'
    },
    timeline: {
      estimatedDuration: 16
    },
    difficulty: 'intermediate',
    technologies: ['React Native', 'Firebase', 'Expo'],
    tags: ['mobile', 'fitness', 'social', 'health'],
    isRemote: true,
    communication: {
      platform: 'discord',
      frequency: 'bi-weekly'
    },
    requirements: 'Mobile development experience required. UI/UX design skills a plus.',
    benefits: 'Work on a growing health & fitness industry project.'
  },
  {
    title: 'Data Analytics Dashboard',
    description: 'Create a comprehensive data analytics dashboard for a retail company. Features include real-time data visualization, custom reporting, and predictive analytics.',
    shortDescription: 'Retail analytics dashboard with real-time visualization',
    category: 'data-science',
    status: 'planning',
    requiredSkills: [
      { name: 'Python', level: 'advanced', isRequired: true },
      { name: 'React', level: 'intermediate', isRequired: true },
      { name: 'D3.js', level: 'intermediate', isRequired: false },
      { name: 'SQL', level: 'intermediate', isRequired: true }
    ],
    maxTeamSize: 5,
    budget: {
      min: 12000,
      max: 25000,
      currency: 'USD'
    },
    timeline: {
      estimatedDuration: 20
    },
    difficulty: 'advanced',
    technologies: ['Python', 'Pandas', 'React', 'D3.js', 'PostgreSQL'],
    tags: ['data-science', 'analytics', 'visualization', 'retail'],
    isRemote: true,
    communication: {
      platform: 'microsoft-teams',
      frequency: 'weekly'
    },
    requirements: 'Strong Python and data analysis skills required. Experience with data visualization libraries preferred.',
    benefits: 'Work with real retail data and build advanced analytics features.'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create projects with user references
    const projectsWithOwners = projects.map((project, index) => ({
      ...project,
      owner: createdUsers[index % createdUsers.length]._id
    }));

    const createdProjects = await Project.create(projectsWithOwners);
    console.log(`Created ${createdProjects.length} projects`);

    // Add some team members to projects
    const project1 = createdProjects[0];
    const project2 = createdProjects[1];

    // Add team members to first project
    await project1.addTeamMember(createdUsers[1]._id, 'UI/UX Designer');
    await project1.addTeamMember(createdUsers[2]._id, 'Backend Developer');

    // Add team member to second project
    await project2.addTeamMember(createdUsers[0]._id, 'Frontend Developer');

    console.log('Added team members to projects');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    users.forEach(user => {
      console.log(`${user.name}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
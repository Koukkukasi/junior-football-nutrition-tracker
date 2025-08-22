import { PrismaClient } from '@prisma/client';
// import { clerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  ageGroup: '10-12' | '13-15' | '16-18' | '19-25';
  role: 'PLAYER' | 'COACH';
}

const testUsers: TestUser[] = [
  // Young players (10-12)
  {
    email: 'tommy.player@test.com',
    password: 'TestPass123!',
    firstName: 'Tommy',
    lastName: 'TestPlayer',
    age: 11,
    position: 'MIDFIELDER',
    ageGroup: '10-12',
    role: 'PLAYER'
  },
  {
    email: 'lisa.keeper@test.com',
    password: 'TestPass123!',
    firstName: 'Lisa',
    lastName: 'TestKeeper',
    age: 12,
    position: 'GOALKEEPER',
    ageGroup: '10-12',
    role: 'PLAYER'
  },
  // Teen players (13-15)
  {
    email: 'alex.forward@test.com',
    password: 'TestPass123!',
    firstName: 'Alex',
    lastName: 'TestForward',
    age: 14,
    position: 'FORWARD',
    ageGroup: '13-15',
    role: 'PLAYER'
  },
  {
    email: 'emma.defender@test.com',
    password: 'TestPass123!',
    firstName: 'Emma',
    lastName: 'TestDefender',
    age: 15,
    position: 'DEFENDER',
    ageGroup: '13-15',
    role: 'PLAYER'
  },
  // Older teens (16-18)
  {
    email: 'mike.mid@test.com',
    password: 'TestPass123!',
    firstName: 'Mike',
    lastName: 'TestMid',
    age: 17,
    position: 'MIDFIELDER',
    ageGroup: '16-18',
    role: 'PLAYER'
  },
  {
    email: 'sara.striker@test.com',
    password: 'TestPass123!',
    firstName: 'Sara',
    lastName: 'TestStriker',
    age: 16,
    position: 'FORWARD',
    ageGroup: '16-18',
    role: 'PLAYER'
  },
  // Young adults (19-25)
  {
    email: 'john.pro@test.com',
    password: 'TestPass123!',
    firstName: 'John',
    lastName: 'TestPro',
    age: 22,
    position: 'MIDFIELDER',
    ageGroup: '19-25',
    role: 'PLAYER'
  },
  {
    email: 'nina.goalie@test.com',
    password: 'TestPass123!',
    firstName: 'Nina',
    lastName: 'TestGoalie',
    age: 20,
    position: 'GOALKEEPER',
    ageGroup: '19-25',
    role: 'PLAYER'
  },
  // Coaches
  {
    email: 'coach.smith@test.com',
    password: 'TestPass123!',
    firstName: 'Coach',
    lastName: 'Smith',
    age: 35,
    position: 'MIDFIELDER',
    ageGroup: '19-25',
    role: 'COACH'
  },
  {
    email: 'coach.jones@test.com',
    password: 'TestPass123!',
    firstName: 'Coach',
    lastName: 'Jones',
    age: 42,
    position: 'DEFENDER',
    ageGroup: '19-25',
    role: 'COACH'
  }
];

async function seedTestUsers() {
  logger.info('🌱 Starting test user seeding...');
  
  try {
    // Create a test team first
    const testTeam = await prisma.team.upsert({
      where: { inviteCode: 'TEST-TEAM-2024' },
      update: {},
      create: {
        name: 'Test FC',
        inviteCode: 'TEST-TEAM-2024',
        description: 'Test team for development'
      }
    });
    
    logger.info('✅ Test team created:', testTeam.name);

    for (const testUser of testUsers) {
      try {
        logger.info(`Creating user: ${testUser.email}`);
        
        // Note: In a real scenario, you would create users through Clerk's API
        // For now, we'll create placeholder records in the database
        // Users will need to sign up through the UI with these emails
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: testUser.email }
        });
        
        if (existingUser) {
          logger.info(`⚠️  User ${testUser.email} already exists, skipping...`);
          continue;
        }
        
        // Create a placeholder user (they'll need to sign up via Clerk)
        const user = await prisma.user.create({
          data: {
            clerkId: `test_${testUser.email.split('@')[0]}`, // Temporary ID
            email: testUser.email,
            name: `${testUser.firstName} ${testUser.lastName}`,
            age: testUser.age,
            position: testUser.position,
            role: testUser.role,
            ageGroup: testUser.ageGroup,
            completedOnboarding: true,
            goals: ['performance', 'energy', 'recovery'],
            trainingDaysPerWeek: 4,
            teamId: testUser.role === 'PLAYER' ? testTeam.id : null,
            preferences: {
              mealReminders: true,
              dailySummary: true,
              weeklyReport: false,
              notificationTime: '12:00'
            }
          }
        });
        
        // If user is a player, add them to the team
        if (testUser.role === 'PLAYER') {
          await prisma.teamMember.create({
            data: {
              userId: user.id,
              teamId: testTeam.id,
              role: 'PLAYER'
            }
          });
        }
        
        // Add some sample food entries for each user
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          await prisma.foodEntry.createMany({
            data: [
              {
                userId: user.id,
                date: date,
                mealType: 'BREAKFAST',
                time: '08:00',
                description: 'Oatmeal with berries and honey',
                location: 'Home'
              },
              {
                userId: user.id,
                date: date,
                mealType: 'LUNCH',
                time: '12:30',
                description: 'Grilled chicken with salad',
                location: 'School'
              },
              {
                userId: user.id,
                date: date,
                mealType: 'SNACK',
                time: '15:00',
                description: 'Apple and protein bar',
                location: 'Training'
              },
              {
                userId: user.id,
                date: date,
                mealType: 'DINNER',
                time: '18:30',
                description: 'Pasta with vegetables',
                location: 'Home'
              }
            ]
          });
          
          // Add performance metrics
          await prisma.performanceMetric.create({
            data: {
              userId: user.id,
              date: date,
              energyLevel: Math.floor(Math.random() * 3) + 3, // 3-5
              sleepHours: 7 + Math.random() * 2, // 7-9 hours
              isTrainingDay: i % 2 === 0,
              trainingType: i % 2 === 0 ? 'Practice' : null,
              matchDay: i === 3
            }
          });
        }
        
        logger.info(`✅ Created test user: ${testUser.email}`);
      } catch (error) {
        logger.error(`❌ Error creating user ${testUser.email}:`, error);
      }
    }
    
    // Create a coach's team
    const coachTeam = await prisma.team.create({
      data: {
        name: 'Elite Squad FC',
        inviteCode: 'ELITE-2024',
        description: 'High performance youth team',
        coachId: 'test_coach.smith'
      }
    });
    
    logger.info('✅ Coach team created:', coachTeam.name);
    
    logger.info('\n📝 Test User Credentials:');
    logger.info('================================');
    testUsers.forEach(user => {
      logger.info(`Email: ${user.email}`);
      logger.info(`Password: ${user.password}`);
      logger.info(`Role: ${user.role}`);
      logger.info('--------------------------------');
    });
    
    logger.info('\n🎯 Team Invite Codes:');
    logger.info('TEST-TEAM-2024 - General test team');
    logger.info('ELITE-2024 - Coach Smith\'s team');
    
    logger.info('\n✅ Test user seeding completed!');
    logger.info('Note: Users need to sign up through the UI with these emails.');
    logger.info('The database has been pre-populated with sample data for each user.');
    
  } catch (error) {
    logger.error('❌ Error seeding test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTestUsers();
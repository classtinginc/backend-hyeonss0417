/* eslint-disable no-console */
import { type Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YONSEI_PAGE_ID = 1;
const KOREA_PAGE_ID = 2;

const userData: Prisma.UserCreateInput[] = [
  {
    email: 'admin@test.com',
    isAdmin: true,
    pageOwnerships: {
      create: [
        {
          page: {
            create: {
              id: YONSEI_PAGE_ID,
              location: '서울',
              schoolName: '연세대학교',
              posts: {
                create: [
                  {
                    title: '연세대학교 입학',
                    content: 'https://www.yonsei.ac.kr',
                  },
                ],
              },
            },
          },
        },
        {
          page: {
            create: {
              id: KOREA_PAGE_ID,
              location: '서울',
              schoolName: '고려대학교',
              posts: {
                create: [
                  {
                    title: '고려대학교 입학',
                    content: 'https://www.korea.ac.kr',
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
  {
    email: 'student1@test.com',
  },
  {
    email: 'student2@test.com',
  },
  {
    email: 'student3@test.com',
  },
  {
    email: 'student4@test.com',
  },
];

const subscriptionData: Prisma.PageSubscriptionCreateInput[] = [
  {
    user: {
      connect: {
        email: 'student1@test.com',
      },
    },
    page: {
      connect: {
        id: YONSEI_PAGE_ID,
      },
    },
  },
  {
    user: {
      connect: {
        email: 'student1@test.com',
      },
    },
    page: {
      connect: {
        id: KOREA_PAGE_ID,
      },
    },
  },
  {
    user: {
      connect: {
        email: 'student2@test.com',
      },
    },
    page: {
      connect: {
        id: YONSEI_PAGE_ID,
      },
    },
  },
  {
    user: {
      connect: {
        email: 'student3@test.com',
      },
    },
    page: {
      connect: {
        id: KOREA_PAGE_ID,
      },
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const u of userData) {
    // eslint-disable-next-line no-await-in-loop
    const user = await prisma.user.create({ data: u });
    console.log(`Created user with id: ${user.id}`);
  }

  for (const s of subscriptionData) {
    // eslint-disable-next-line no-await-in-loop
    const subscription = await prisma.pageSubscription.create({ data: s });
    console.log(`Created subscription with id: ${subscription.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  // eslint-disable-next-line promise/always-return
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
    process.exit(1);
  });


import { prisma } from '../src/lib/prisma';

async function checkQuickBooksConfig() {
  try {
    const configs = await prisma.organizationIntegrationConfig.findMany({
      where: {
        provider: 'QUICKBOOKS',
      },
      select: {
        orgId: true,
        redirectUri: true,
        isEnabled: true,
      }
    });

    console.log(`Found ${configs.length} QuickBooks configurations:`);
    console.table(configs);
  } catch (error) {
    console.error('Error querying QuickBooks configs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuickBooksConfig();

import { PrismaClient, PipelineType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orgId = process.env.SEED_ORG_ID;

  if (!orgId) {
    console.error("ERROR: SEED_ORG_ID environment variable is required");
    process.exit(1);
  }

  console.log(`Seeding pipelines for organization: ${orgId}`);

  const pipelines = [
    {
      key: "sales-tasks",
      name: "Sales Pipeline",
      type: PipelineType.SALES,
      description: "Handles inbound demos, pricing questions, and follow-ups.",
      stages: [
        { key: "new_intake", name: "New / Unqualified", order: 1 },
        { key: "qualification", name: "Qualifying", order: 2 },
        { key: "proposal", name: "Proposal Sent", order: 3 },
        { key: "negotiation", name: "Negotiation / Questions", order: 4 },
        { key: "won", name: "Closed Won", order: 5, isTerminal: true },
        { key: "lost", name: "Closed Lost", order: 6, isTerminal: true }
      ]
    },
    {
      key: "support-tasks",
      name: "Support Pipeline",
      type: PipelineType.SUPPORT,
      description: "For bugs, 'not working' tickets, and how-to questions.",
      stages: [
        { key: "new_intake", name: "New / Untriaged", order: 1 },
        { key: "triage", name: "Triage & Categorize", order: 2 },
        { key: "in_progress", name: "Investigating / Fixing", order: 3 },
        { key: "awaiting_customer", name: "Waiting on Customer Reply", order: 4 },
        { key: "resolved", name: "Resolved", order: 5, isTerminal: true },
        { key: "closed_no_action", name: "Closed – No Action", order: 6, isTerminal: true }
      ]
    },
    {
      key: "billing-tasks",
      name: "Billing Pipeline",
      type: PipelineType.BILLING,
      description: "Invoices, refunds, and payment issues.",
      stages: [
        { key: "new_intake", name: "New / Unreviewed", order: 1 },
        { key: "verification", name: "Verify Account & Records", order: 2 },
        { key: "resolution", name: "Resolve Billing Issue", order: 3 },
        { key: "confirm_customer", name: "Confirm with Customer", order: 4 },
        { key: "completed", name: "Completed", order: 5, isTerminal: true },
        { key: "escalated", name: "Escalated to Finance", order: 6, isTerminal: true }
      ]
    },
    {
      key: "internal-tasks",
      name: "Internal Ops Pipeline",
      type: PipelineType.INTERNAL,
      description: "Internal follow-ups and ops work.",
      stages: [
        { key: "backlog", name: "Backlog / Ideas", order: 1 },
        { key: "ready", name: "Ready to Start", order: 2 },
        { key: "in_progress", name: "In Progress", order: 3 },
        { key: "needs_review", name: "Needs Review", order: 4 },
        { key: "done", name: "Done", order: 5, isTerminal: true }
      ]
    },
    {
      key: "generic-tasks",
      name: "General Pipeline",
      type: PipelineType.GENERIC,
      description: "Catch-all pipeline for uncategorized tasks.",
      stages: [
        { key: "new_intake", name: "New", order: 1 },
        { key: "in_progress", name: "In Progress", order: 2 },
        { key: "needs_review", name: "Needs Review", order: 3 },
        { key: "done", name: "Done", order: 4, isTerminal: true }
      ]
    }
  ];

  for (const p of pipelines) {
    console.log(`Upserting pipeline: ${p.name} (${p.key})`);

    const pipeline = await prisma.pipeline.upsert({
      where: { key: p.key },
      update: {
        name: p.name,
        description: p.description,
        type: p.type
      },
      create: {
        orgId,
        key: p.key,
        name: p.name,
        description: p.description,
        type: p.type
      }
    });

    console.log(`  Created/updated pipeline: ${pipeline.id}`);

    // Delete existing stages to prevent duplicates on re-run
    await prisma.pipelineStage.deleteMany({
      where: { pipelineId: pipeline.id }
    });

    // Create stages
    const stages = await prisma.pipelineStage.createMany({
      data: p.stages.map((s) => ({
        pipelineId: pipeline.id,
        key: s.key,
        name: s.name,
        order: s.order,
        isTerminal: s.isTerminal ?? false
      }))
    });

    console.log(`  Created ${stages.count} stages`);
  }

  console.log("\nPipeline seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during pipeline seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

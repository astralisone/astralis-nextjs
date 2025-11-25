import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface TaskTemplateDefinition {
  id: string;
  label: string;
  applicableSources: string[];
  category: string;
  department: string;
  staffRole: string;
  typicalMinutes: number;
  defaultPriority: number;
  pipeline: {
    preferredPipelineKey: string;
    defaultStageKey: string;
  };
  steps: Array<{
    id: string;
    label: string;
    order: number;
  }>;
  agentConfig: {
    systemPrompt: string;
    allowedActions: string[];
    completionCriteria: {
      status?: string;
      requiredStepsCompleted?: string[];
    };
  };
}

async function main() {
  console.log("Loading task templates from config/task-templates.json");

  // Load task templates from JSON file
  const configPath = path.join(process.cwd(), "config", "task-templates.json");

  if (!fs.existsSync(configPath)) {
    console.error(`ERROR: Config file not found at ${configPath}`);
    process.exit(1);
  }

  const templatesJson = fs.readFileSync(configPath, "utf-8");
  const templates: TaskTemplateDefinition[] = JSON.parse(templatesJson);

  console.log(`Found ${templates.length} task templates to seed`);

  for (const template of templates) {
    console.log(`Upserting template: ${template.label} (${template.id})`);

    await prisma.taskTemplate.upsert({
      where: { id: template.id },
      update: {
        label: template.label,
        category: template.category,
        department: template.department,
        staffRole: template.staffRole,
        typicalMinutes: template.typicalMinutes,
        defaultPriority: template.defaultPriority,
        applicableSources: template.applicableSources,
        preferredPipelineKey: template.pipeline.preferredPipelineKey,
        defaultStageKey: template.pipeline.defaultStageKey,
        definition: template as any // Store the full template as JSON
      },
      create: {
        id: template.id,
        label: template.label,
        category: template.category,
        department: template.department,
        staffRole: template.staffRole,
        typicalMinutes: template.typicalMinutes,
        defaultPriority: template.defaultPriority,
        applicableSources: template.applicableSources,
        preferredPipelineKey: template.pipeline.preferredPipelineKey,
        defaultStageKey: template.pipeline.defaultStageKey,
        definition: template as any // Store the full template as JSON
      }
    });

    console.log(`  ✓ Template ${template.id} created/updated`);
  }

  console.log("\nTask template seeding completed successfully!");
  console.log(`Total templates seeded: ${templates.length}`);
}

main()
  .catch((e) => {
    console.error("Error during task template seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

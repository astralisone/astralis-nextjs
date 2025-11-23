const { queueDocumentProcessing } = require('./src/workers/queues/document-processing.queue.ts');

async function test() {
  try {
    console.log('Queueing test document...');
    await queueDocumentProcessing({
      documentId: 'cmi83i8s40001zpc95tfmkcmf',
      orgId: 'cmi80d2ov0000vlr7tu26swz7',
      performOCR: true,
      performVisionExtraction: false,
      language: 'eng',
    });
    console.log('Job queued successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();

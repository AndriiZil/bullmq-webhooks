import { Worker } from 'bullmq';
import { configuration } from './config';
import queues from './queues';

export const taskWorker = new Worker<{ userId: string; task: any }>(
  configuration.queues.taskQueueName,
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    const result = `Result data from task performed for ${job.name} with ID ${job.id}`;

    return queues.webhooksQueue.add(
      job.name,
      { userId: job.data.userId, result },
      {
        attempts: configuration.options.maxAttempts,
        backoff: { type: 'exponential', delay: configuration.options.backoffDelay },
      }
    );
  },
  { connection: configuration.connection }
);

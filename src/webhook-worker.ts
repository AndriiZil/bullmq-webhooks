import axios from 'axios';
import { Worker } from 'bullmq';

import queues from './queues';
import { getUserById } from './users';
import { configuration } from './config';

export const webhooksWorker = new Worker<{ userId: string; result: string }>(
  configuration.queues.webhooksQueue,
  async (job) => {
    const { userId, result } = job.data;
    const user = await getUserById(userId);

    const maxWebhookAttempts = configuration.options.maxAttempts - configuration.options.maxAttemptsForEmail;

    if (job.attemptsMade < maxWebhookAttempts) {
      console.log(
        `Calling webhook for "${result}", attempt ${job.attemptsMade + 1} of ${maxWebhookAttempts}`
      );
      return axios.post(user.webhook, { json: { result } });
    } else {
      console.log(
        `Giving up, lets mail user about webhook not working for "${result}"`
      );
      // Send an email to the user about failing webhooks.
      return queues.mailQueue.add('webhook-failure', {
        mailOpts: {
          from: 'manast@taskforce.sh',
          subject: 'Your Webhook is failing',
          text: `We tried to send a notification to your webhook ${user.webhook} ${maxWebhookAttempts} times and it is failing.`,
          to: user.email,
        },
      });
    }
  },
  {
    connection: configuration.connection,
  }
);

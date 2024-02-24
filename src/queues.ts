import { Queue } from 'bullmq';
import { configuration } from './config';

export default {
  webhooksQueue: new Queue('webhooks', { connection: configuration.connection }),
  tasksQueue: new Queue('tasks', { connection: configuration.connection }),
  mailQueue: new Queue('mails', { connection: configuration.connection }),
}
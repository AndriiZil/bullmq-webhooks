export const configuration = {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
  serverPort: 3000,
  userServerPort: 8080,
  queues: {
    taskQueueName: 'tasks',
    webhooksQueue: 'webhooks',
    mailQueue: 'mails',
  },
  options: {
    maxAttempts: 10,
    backoffDelay: 2000,
    maxAttemptsForEmail: 5,
  }
}

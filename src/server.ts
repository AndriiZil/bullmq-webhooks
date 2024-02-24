import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from'@bull-board/express';

import queues from './queues';
import { configuration } from './config';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(queues.tasksQueue),
    new BullMQAdapter(queues.webhooksQueue),
    new BullMQAdapter(queues.mailQueue),
  ],
  serverAdapter: serverAdapter,
});

const server = express();

server.use(express.json());
server.use('/admin/queues', serverAdapter.getRouter());

server.post('/users/:userId/tasks/:taskType', async (req, res) => {
  try {
    const taskData = req.body;
    console.log(`Received task ${req.params.taskType} to process...`);

    const job = await queues.tasksQueue.add(
      req.params.taskType,
      { userId: req.params.userId, taskData }
    );

    res.status(201).json({ jobId: job.id });
  } catch (err) {
    res.end(err);
  }
})

server.listen(configuration.serverPort, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6379 by default');
});

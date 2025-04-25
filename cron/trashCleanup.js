import cron from 'node-cron';
import Query from '../models/Query.js';

const setupTrashCleanup = () => {
  // Schedule the job to run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running trash cleanup job...');
      
      // Calculate the date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find and delete queries that have been in trash for more than 30 days
      const result = await Query.deleteMany({
        isTrashed: true,
        updatedAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Trash cleanup completed. Deleted ${result.deletedCount} queries.`);
    } catch (error) {
      console.error('Error in trash cleanup job:', error);
    }
  });

  console.log('Trash cleanup job scheduled to run daily at 2 AM');
};

export default setupTrashCleanup; 
import express from 'express';

//faq routes
import {
  getFAQs,
  createFAQ,
  getFAQDetails,
  updateFAQ,
  deleteFAQ
} from '../controllers/faqController.js';

//announcement routes
import {
  getAllAnnouncements,
  createAnnouncement,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/adminAnnouncementController.js';

//query routes
import {
  getAllQueries,
  getQueryDetails,
  updateQueryStatus,
  markQueryPublic,
  markQueryPrivate,
  forwardQuery,
  addResponse,
  getTrashedQueries,
  moveToTrash,
  restoreFromTrash
} from '../controllers/adminQueryController.js';

//analytics routes
import {
  getAnalytics,
} from '../controllers/analyticsController.js';


import { handleFileUpload } from '../middlewares/upload.js';
import { adminAuth } from '../middlewares/adminAuth.js';


import {
  getPublicQueries
} from '../controllers/publicQueryController.js';



const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// FAQ Management Routes
router.get('/faqs', getFAQs);
router.post('/faqs', createFAQ);
router.get('/faqs/:id', getFAQDetails);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);
  
// Announcement Management Routes
router.get('/announcements', getAllAnnouncements);
router.post('/announcements', createAnnouncement);
router.get('/announcements/:id', getAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);



//public queries routes
router.get('/public/queries', getPublicQueries);


// Trash Management Routes
router.get('/trash', getTrashedQueries);
router.put('/trash/:id', moveToTrash);
router.put('/trash/restore/:id', restoreFromTrash)


// Query Management Routes
router.get('/queries', getAllQueries);
router.get('/queries/:id', getQueryDetails);
router.put('/queries/:id/status', updateQueryStatus);

router.put('/queries/:id/public', markQueryPublic);
router.put('/queries/:id/private', markQueryPrivate);

router.post('/queries/forward/:id', forwardQuery);
router.post('/queries/respond/:id', handleFileUpload, addResponse);

// Analytics Management Routes
router.get('/analytics', getAnalytics);


export default router; 
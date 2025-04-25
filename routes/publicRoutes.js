import express from 'express';

//faq routes
import {getFAQs_public} from '../controllers/faqController.js';

//announcement routes
import {
  getAllAnnouncements_public,
  getAnnouncement
} from '../controllers/adminAnnouncementController.js';

//query routes
import {getPublicQueries_public} from '../controllers/publicQueryController.js';


//query routes
import {
  postQuery,
  getQueryStatus,
  addFollowUp,
} from '../controllers/queryController.js';

//upload routes
import { handleFileUpload } from '../middlewares/upload.js';



const router = express.Router();

// FAQ Routes
router.get('/faqs', getFAQs_public);

// Announcement Routes
router.get('/announcements', getAllAnnouncements_public);
router.get('/announcements/:id', getAnnouncement);


// Query Routes
router.get('/faqs', getFAQs_public);

//query fetching routes
router.post('/queries/post', handleFileUpload, postQuery);
router.get('/queries/status', getQueryStatus);
router.post('/queries/follow-up/:id', handleFileUpload, addFollowUp);

//public queries routes
router.get('/public/queries', getPublicQueries_public);


export default router; 
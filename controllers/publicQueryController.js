import Query from '../models/Query.js';
import { QUERY_STATUSES } from '../constants.js';

// Get all public queries for admin's department
export const getPublicQueries_public = async (req, res) => {
  try {
    const queries = await Query.find({
       markedPublic: true,
       publicConsent: true,
       status: QUERY_STATUSES.RESOLVED
      }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while retrieving public queries.' });
  }
};


export const getPublicQueries = async (req, res) => {
  try {
    const { 
      sortBy, 
      sortOrder,
      startDate,
      endDate,
      queryId,
      email,
      keyword,
      department
    } = req.query;

    // Build filter object with required public query conditions
    const filter = {
      markedPublic: true,
      publicConsent: true,
      department: req.session.department,
      status: QUERY_STATUSES.RESOLVED
    };

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Query ID filter
    if (queryId) {
      filter.queryId = { $regex: queryId, $options: 'i' };
    }

    // Email filter
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    // Department filter
    if (department) {
      filter.department = department;
    }

    // Keyword search in public title and description
    if (keyword) {
      filter.$or = [
        { 'public.title': { $regex: keyword, $options: 'i' } },
        { 'public.description': { $regex: keyword, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort by creation date
    }

    const queries = await Query.find(filter)
      .sort(sort)
      .select('public department updatedAt createdAt queryId email'); // Added queryId and email to selected fields

    res.json(queries);
  } catch (error) {
    console.error('Error fetching public queries:', error);
    res.status(500).json({ message: 'Error fetching public queries', error: error.message });
  }
};

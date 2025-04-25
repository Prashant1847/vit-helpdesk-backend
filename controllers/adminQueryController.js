import Query from '../models/Query.js';
import { sendResponseNotification } from '../utils/emailService.js';
import {ROLES, QUERY_STATUSES } from '../constants.js';
// Get all queries for admin's department
export const getQueries = async (req, res) => {
  try {
    const department = req.session.department;
    const queries = await Query.find({ department }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queries', error: error.message });
  }
};

// Get all queries with optional filters
export const getAllQueries = async (req, res) => {
  try {
    const { 
      status, 
      sortBy, 
      sortOrder,
      startDate,
      endDate,
      queryId,
      email,
      keyword,
      isTrashed
    } = req.query;

    const department = req.session.department;

    // Build filter object
    const filter = { department };

    if (status && status !== 'all') {
      filter.status = status;
    }

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

    if(isTrashed){
      filter.isTrashed = false;
    }

    // Email filter
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    // Keyword search in title and description
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];  
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort by creation date
    }

    console.log(filter)
    const queries = await Query.find(filter)
      .sort(sort)
      .select('-conversationHistory');

    res.json({ queries });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Error fetching queries' });
  }
};

// Get query details
export const getQueryDetails = async (req, res) => {
  try {
    const query = await Query.findOne({queryId: req.params.id});

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({ query });
  } catch (error) {
    console.error('Error fetching query details:', error);
    res.status(500).json({ message: 'Error fetching query details' });
  }
};

// Update query status
export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({ query });
  } catch (error) {
    console.error('Error updating query status:', error);
    res.status(500).json({ message: 'Error updating query status' });
  }
};

// Add response to query
export const addResponse = async (req, res) => {
  try {
    const { message, status } = req.body;
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    })) : [];

    const query = await Query.findOne({queryId: req.params.id});

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    query.status = status;
    query.conversationHistory.push({
      message,
      from: ROLES.ADMIN,
      timestamp: new Date(),
      files: files
    });

    query.updatedAt = new Date();

    // Send email notification to user
    if (query.notificationRequired) {
      await sendResponseNotification(
        query.email,
        query.name || ROLES.USER,
        query.queryId,
      );
      
      query.notificationRequired = false;
    }
    
    await query.save();
    res.json(query);
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ message: 'Error adding response' });
  }
};

// Mark query as public/private
export const markQueryPublic = async (req, res) => {
  try {
    const {public: publicData } = req.body;

    const query = await Query.findOneAndUpdate(
      {
        queryId: req.params.id,
      },
      {
        markedPublic: true,
        updatedAt: new Date(),
        public: {
          title: publicData.title,
          description: publicData.description,
          response: publicData.response
        }
      },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found or cannot be made public/private' });
    }

    res.json({ query });
  } catch (error) {
    console.error('Error marking query as public/private:', error);
    res.status(500).json({ message: 'Error marking query as public/private' });
  }
};

// Mark query as private
export const markQueryPrivate = async (req, res) => {
  try {
    const query = await Query.findOneAndUpdate(
      {
        queryId: req.params.id,
        publicConsent: true,
        status: QUERY_STATUSES.RESOLVED
      },
      { 
        markedPublic: false,
        public: {
          title: '',
          description: '',
          response: ''
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found or cannot be made private' });
    }

    res.json({ query });
  } catch (error) {
    console.error('Error marking query as private:', error);
    res.status(500).json({ message: 'Error marking query as private' });
  }
};

// Forward query to another department
export const forwardQuery = async (req, res) => {
  try {
    const { toDepartment, note } = req.body;
    const { name, email } = req.session;

    const query = await Query.findOne({ queryId: req.params.id });

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Add to forwarding history
    query.forwardingHistory.push({
      from: query.department,
      to: toDepartment,
      forwardedBy: {
        name,
        email
      },
      note,
      forwardedAt: new Date()
    });

    // Update department and status
    query.department = toDepartment;
    query.status = QUERY_STATUSES.IN_PROGRESS;
    query.updatedAt = new Date();

    await query.save();

    res.json({ 
      message: 'Query forwarded successfully',
      query 
    });
  } catch (error) {
    console.error('Error forwarding query:', error);
    res.status(500).json({ message: 'Error forwarding query' });
  }
};

// Get trashed queries
export const getTrashedQueries = async (req, res) => {
  try {
    const { 
      status, 
      sortBy, 
      sortOrder,
      startDate,
      endDate,
      queryId,
      email,
      keyword
    } = req.query;

    const department = req.session.department;

    // Build filter object
    const filter = { department, isTrashed: true };

    if (status && status !== 'all') {
      filter.status = status;
    }

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

    // Keyword search in title and description
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
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
      .select('-conversationHistory');
    res.json(queries);
  } catch (error) {
    console.error('Error fetching trashed queries:', error);
    res.status(500).json({ message: 'Error fetching trashed queries' });
  }
};

// Move query to trash
export const moveToTrash = async (req, res) => {
  try {
    const query = await Query.findOneAndUpdate(
      { queryId: req.params.id },
      { isTrashed: true, updatedAt: new Date() },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({ message: 'Query moved to trash successfully', query });
  } catch (error) {
    console.error('Error moving query to trash:', error);
    res.status(500).json({ message: 'Error moving query to trash' });
  }
};

// Restore query from trash
export const restoreFromTrash = async (req, res) => {
  try {
    const query = await Query.findOneAndUpdate(
      { queryId: req.params.id },
      { isTrashed: false, updatedAt: new Date() },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({ message: 'Query restored successfully', query });
  } catch (error) {
    console.error('Error restoring query:', error);
    res.status(500).json({ message: 'Error restoring query' });
  }
}; 
import Query from '../models/Query.js';
import path from 'path';
import { sendQueryConfirmation } from '../utils/emailService.js';
import { ROLES } from '../constants.js';
// Generate a unique query ID
export const generateQueryId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};


// Middleware to handle file upload with queryId
export const postQuery = async (req, res) => {
  try {
    const { name, email, department, title, description, publicConsent } = req.body;
    const queryId = req.body.queryId;
    
    
    // Handle files if they exist
    const files = req.files ? req.files.map(file => {
      if (!file || !file.filename) {
        console.error('Invalid file object:', file);
        return null;
      }
      return {
        filename: file.filename,
        originalname: file.originalname,
        path: path.join('server', 'uploads', queryId, file.filename),
        mimetype: file.mimetype
      };
    }).filter(Boolean) : [];

    // Create new query
    const query = new Query({
      queryId,
      name,
      email,
      department,
      title,
      description,
      publicConsent,
      conversationHistory: [{
        message: description,
        from: ROLES.USER,
        timestamp: new Date(),
        files: files
      }]
    });

    await query.save();

    // Send email confirmation
    if (query.notificationRequired) {
      await sendQueryConfirmation(email, name || 'User', queryId);
    }

    res.status(201).json({
      queryId: query.queryId
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error posting query',
    });
  }
};

export const getQueryStatus = async (req, res) => {
  try {
    const { queryId, email } = req.query;
    if (!queryId || !email) {
      return res.status(400).json({message: 'Query ID and email are required'});
    }

    const query = await Query.findOne({ queryId, email });

    if (!query) {
      return res.status(404).json({message: 'Query not found'});
    }


    // Check if query is in trash
    if (query.isTrashed) {
      return res.status(404).json({
        message: 'This query has been removed by the VIT Help Desk. It was either resolved or deleted due to inactivity. If you need further assistance, please create a new query.'
      });
    }

    query.notificationRequired = true;
    await query.save();

    res.json(query);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting query status',
    });
  }
};


export const addFollowUp = async (req, res) => {
  try {
    const { queryId, email, message } = req.body;
    
    // Handle files if they exist
    const files = req.files ? req.files.map(file => {
      if (!file || !file.filename) {
        return null;
      }
      return {
        filename: file.filename,
        originalname: file.originalname,
        path: path.join('server', 'uploads', queryId, file.filename),
        mimetype: file.mimetype
      };
    }).filter(Boolean) : [];

    if (!queryId || !email || !message) {
      return res.status(400).json({
        message: 'Query ID, email, and message are required'
      });
    }

    const query = await Query.findOne({ queryId, email });

    if (!query) {
      return res.status(404).json({
        message: 'Query not found'
      });
    }

    // Add new message to conversation history
    query.conversationHistory.push({
      message,
      from: ROLES.USER,
      timestamp: new Date(),
      files: files
    });

    await query.save();

    res.json(query);

    
  } catch (error) {
    res.status(500).json({
      message: 'Error adding follow-up message',
    });
  }
};

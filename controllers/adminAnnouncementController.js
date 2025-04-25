import Announcement from '../models/Announcement.js';

// Get all announcements for admin's department
export const getAllAnnouncements_public = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};


export const getAllAnnouncements = async (req, res) => {
  try {
    const department = req.session.department;
    const announcements = await Announcement.find({ department }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, description} = req.body;
    const department = req.session.department;
    const announcement = new Announcement({
      title,
      description,
      department
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error creating announcement', error: error.message });
  }
};

// Get announcement
export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement', error: error.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    const department = req.session.deparment

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, description, department },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: 'Error updating announcement', error: error.message });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
}; 
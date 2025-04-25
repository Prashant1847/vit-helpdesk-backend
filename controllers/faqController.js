import FAQ from '../models/FAQ.js';

// Get all FAQs for admin's department
export const getFAQs_public = async (req, res) => {
  try {
    const faqs = await FAQ.find({}).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};


export const getFAQs = async (req, res) => {
  try {
    const department = req.session.department;
    const faqs = await FAQ.find({ department }).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

// Get FAQ details by ID
export const getFAQDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new FAQ
export const createFAQ = async (req, res) => {
  try {
    const {question, answer } = req.body;
    const department = req.session.department;

    const faq = new FAQ({
      department,
      question,
      answer
    });

    const savedFAQ = await faq.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const {question, answer } = req.body;
    const department = req.session.department;

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      {
        department,
        question,
        answer,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(updatedFAQ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const department = req.session.department;
    const deletedFAQ = await FAQ.findOneAndDelete({ _id: id, department });

    if (!deletedFAQ) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

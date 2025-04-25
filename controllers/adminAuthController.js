import Admin from '../models/Admin.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) { 
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session data
    req.session.adminId = admin._id;
    req.session.name = admin.name;
    req.session.email = admin.email;
    req.session.department = admin.department;

    res.json({
      name: admin.name,
      email: admin.email,
      department: admin.department
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};


export const checkAdminSession = (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.json({
    name: req.session.name,
    email: req.session.email,
    department: req.session.department
  });
}; 

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout', error: err.message });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
}; 


const express = require('express');
const router = express.Router();
const { User, Client, Team, Task, ClientTask, Message } = require('../models/Models');

// ==========================================
// 1. AUTHENTICATION & ADMIN CREDENTIALS
// ==========================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    // Check DB for updated Admin credentials, fallback to default if not found
    let adminUser = await User.findOne({ role: 'Admin' });
    const adminEmail = adminUser ? adminUser.email : 'admin@renza.com';
    const adminPass = adminUser ? adminUser.password : 'admin123';

    // SECURE Master Admin bypass
    if (username.trim() === adminEmail && password === adminPass) {
      console.log("👑 Master Admin logged in successfully");
      return res.json({ name: 'Master Admin', role: 'Admin', email: adminEmail });
    }

    // Regular Member Login
    const query = {
      $or: [
        { username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } }, 
        { email: { $regex: new RegExp(`^${username.trim()}$`, 'i') } }
      ]
    };
    const user = await User.findOne(query);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userObj = user.toObject();
    if (!userObj.role) userObj.role = 'Member';
    return res.json(userObj);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current Admin Credentials for Profile Page
router.get('/admin/credentials', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'Admin' });
    if (admin) {
      res.json({ email: admin.email, password: admin.password });
    } else {
      res.json({ email: 'admin@renza.com', password: 'admin123' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Admin Credentials from Profile Page
router.put('/admin/credentials', async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await User.findOne({ role: 'Admin' });
    
    if (admin) {
      admin.email = email;
      admin.username = email;
      admin.password = password;
      await admin.save();
    } else {
      admin = await User.create({
        name: 'Master Admin',
        role: 'Admin',
        email: email,
        username: email,
        password: password,
        memberType: 'System Administrator'
      });
    }
    console.log("✅ Admin credentials successfully updated in MongoDB!");
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. EXPLICIT CHAT ROUTES (Fixes Chat Failing)
// ==========================================
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GENERIC CRUD FACTORY (Clients, Teams, Tasks)
// ==========================================
const registerRoute = (path, model) => {
  router.get(`/${path}`, async (req, res) => res.json(await model.find()));
  
  router.post(`/${path}`, async (req, res) => {
    try {
      const item = await model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.put(`/${path}/:id`, async (req, res) => {
    try {
      const updatedItem = await model.findByIdAndUpdate(
        req.params.id, 
        { $set: req.body }, 
        { returnDocument: 'after' } // <-- Clean warning-free syntax
      );
      res.json(updatedItem);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete(`/${path}/:id`, async (req, res) => { 
    await model.findByIdAndDelete(req.params.id); 
    res.json({ msg: 'Deleted' }); 
  });
};

registerRoute('users', User);
registerRoute('clients', Client);
registerRoute('teams', Team);
registerRoute('tasks', Task);
registerRoute('clienttasks', ClientTask);
registerRoute('messages', Message);

module.exports = router;
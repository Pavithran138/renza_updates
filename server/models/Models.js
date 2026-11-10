const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, default: 'Member' },
  memberType: { type: String, default: 'Non-Tech' },
  dateJoined: { type: String, default: '' }
}, { timestamps: true });

const ClientSchema = new mongoose.Schema({
  companyName: { type: String, default: '' }, 
  name: { type: String, required: true }, 
  email: { type: String },
  phone: { type: String },
  projectDetails: { type: String }, 
  status: { type: String, default: 'Pending' },
  assignedTeam: { type: String, default: '' },
  assignedMembers: { type: Array, default: [] }
}, { timestamps: true });

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: 'General Operations' },
  members: { type: Array, default: [] }
}, { timestamps: true });

// Internal Company Tasks
// Internal Company Tasks
// Internal Company Tasks
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: String },
  client: { type: String, default: 'Internal' }, 
  status: { type: String, default: 'Pending' },
  deadline: { type: String, default: '' },
  comments: [{ // <-- NEW COMMENTS / UPDATES ARRAY
    text: String,
    author: String,
    link: String,
    time: String
  }]
}, { timestamps: true, collection: 'tasks' }); 

// Client Delivery Tasks
const ClientTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: String },
  client: { type: String },
  status: { type: String, default: 'Pending' },
  deadline: { type: String, default: '' },
  comments: [{ // <-- NEW COMMENTS / UPDATES ARRAY
    text: String,
    author: String,
    link: String,
    time: String
  }]
}, { timestamps: true, collection: 'clienttasks' });

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  recipient: { type: String, default: 'general' },
  time: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Client = mongoose.model('Client', ClientSchema);
const Team = mongoose.model('Team', TeamSchema);
const Task = mongoose.model('Task', TaskSchema);
const ClientTask = mongoose.model('ClientTask', ClientTaskSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = { User, Client, Team, Task, ClientTask, Message };
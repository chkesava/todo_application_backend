const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false }
}, { _id: false });

const TodoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'General' },
  dueDate: { type: Date },
  deleted: { type: Boolean, default: false },
  subtasks: [SubtaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);

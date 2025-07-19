const Todo = require('../models/Todo');

// Create new todo
exports.createTodo = async (req, res) => {
  const { text, priority, category, dueDate, subtasks } = req.body;
  const todo = await Todo.create({
    user: req.user._id,
    text,
    priority,
    category,
    dueDate,
    subtasks
  });
  res.status(201).json(todo);
};

// Get all todos (with filters/pagination/search)
exports.getTodos = async (req, res) => {
  const { page = 1, limit = 10, search = '', priority, category, sortBy = 'createdAt', order = 'desc', completed, deleted } = req.query;
  const query = { user: req.user._id };

  if (search) query.text = { $regex: search, $options: 'i' };
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (typeof completed !== 'undefined') query.completed = completed === 'true';
  if (typeof deleted !== 'undefined') query.deleted = deleted === 'true';
  else query.deleted = false; // Show only not deleted by default

  const todos = await Todo.find(query)
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Todo.countDocuments(query);

  res.json({ todos, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

// Get single todo
exports.getTodo = async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.json(todo);
};

// Update todo
exports.updateTodo = async (req, res) => {
  const updates = req.body;
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
  if (!todo) return res.status(404).json({ message: 'Todo not found or no permission' });
  res.json(todo);
};

// Soft-delete todo
exports.softDeleteTodo = async (req, res) => {
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { deleted: true }, { new: true });
  if (!todo) return res.status(404).json({ message: 'Todo not found or no permission' });
  res.json({ message: 'Todo soft-deleted' });
};

// Restore soft-deleted todo
exports.restoreTodo = async (req, res) => {
  const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { deleted: false }, { new: true });
  if (!todo) return res.status(404).json({ message: 'Todo not found or no permission' });
  res.json({ message: 'Todo restored' });
};

// Permanently delete todo
exports.deleteTodo = async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!todo) return res.status(404).json({ message: 'Todo not found or no permission' });
  res.json({ message: 'Todo permanently deleted' });
};

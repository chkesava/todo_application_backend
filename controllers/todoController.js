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
  try {
    const {
      page = 1,
      limit = 10,
      search,
      priority,
      category,
      sortBy = 'createdAt',
      order = 'desc',
      completed,
      deleted,
    } = req.query;

    const query = { user: req.user._id };

    // Add text search filter only if search param is provided and not empty
    if (search && search.trim() !== '') {
      query.text = { $regex: search.trim(), $options: 'i' };
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (typeof completed !== 'undefined') {
      query.completed = completed === 'true';
    }

    if (typeof deleted !== 'undefined') {
      query.deleted = deleted === 'true';
    } else {
      // By default, show only non-deleted todos
      query.deleted = false;
    }

    // Parse pagination params as integers
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);

    const total = await Todo.countDocuments(query);

    const todos = await Todo.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.json({
      todos,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error while fetching todos.' });
  }
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

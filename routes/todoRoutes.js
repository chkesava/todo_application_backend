const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTodo, getTodos, getTodo, updateTodo,
  deleteTodo, softDeleteTodo, restoreTodo
} = require('../controllers/todoController');

router.route('/')
  .post(auth, createTodo)
  .get(auth, getTodos);

router.route('/:id')
  .get(auth, getTodo)
  .put(auth, updateTodo)
  .delete(auth, deleteTodo);

router.put('/:id/soft-delete', auth, softDeleteTodo);
router.put('/:id/restore', auth, restoreTodo);

module.exports = router;

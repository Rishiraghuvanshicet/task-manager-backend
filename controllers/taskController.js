const Task = require('../models/Task');
//------------------get all tasks---------------------------------------------
const getTasks = async (req, res, next) => {
  try {
    const rawSearch = req.query.search ? String(req.query.search).trim().toLowerCase() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';

    // Step 1: fetch tasks from DB
    // If status provided, filter by status in DB. Otherwise get all.
    let tasks;
    if (status) {
      tasks = await Task.find({ status }).sort('-createdAt').exec();
    } else {
      tasks = await Task.find().sort('-createdAt').exec();
    }

    // Step 2: if search provided, filter in JavaScript (simple substring match)
    if (rawSearch) {
      tasks = tasks.filter((task) => {
        const title = task.title ? String(task.title).toLowerCase() : '';
        const description = task.description ? String(task.description).toLowerCase() : '';
        return title.includes(rawSearch) || description.includes(rawSearch);
      });
    }
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};
//------------------get task by id---------------------------------------------
const getTaskById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description ? String(description) : '',
      ...(status ? { status: String(status) } : {})
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, description, status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};

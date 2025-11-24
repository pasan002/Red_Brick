import Task from '../models/Task.js';

const createTask = async (req, res) => {
  try {
    console.log('Received task data:', req.body); // Add this for debugging
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Error creating task:', error); // Add this for debugging
    res.status(400).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    console.log('Getting all tasks...');
    const tasks = await Task.find().sort({ createdAt: -1 });
    console.log('Tasks found:', tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createTask, getTasks, updateTask, deleteTask };
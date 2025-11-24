import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';

const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const router = express.Router();
const Project = require('../models/Project');

// Route to create a new project
router.post('/', createProject);

// Route to get all projects
router.get('/', getProjects);

// Route to get a single project by ID
router.get('/:id', getProjectById);

// Route to update a project
router.put('/:id', updateProject);

// Route to delete a project
router.delete('/:id', deleteProject);

router.post('/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
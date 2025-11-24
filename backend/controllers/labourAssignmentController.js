import LabourAssignment from '../models/LabourAssignment.js';

export const getLabourAssignments = async (req, res) => {
  try {
    const assignments = await LabourAssignment.find().sort({ assignmentDate: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching labour assignments' });
  }
};

export const createLabourAssignment = async (req, res) => {
  try {
    const newAssignment = new LabourAssignment(req.body);
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLabourAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAssignment = await LabourAssignment.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLabourAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAssignment = await LabourAssignment.findByIdAndDelete(id);
    if (!deletedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
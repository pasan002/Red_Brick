import express from 'express';
import { getLabourAssignments, createLabourAssignment, updateLabourAssignment, deleteLabourAssignment } from '../controllers/labourAssignmentController.js';

const router = express.Router();

router.get('/labour-assignments', getLabourAssignments);
router.post('/labour-assignments', createLabourAssignment);
router.put('/labour-assignments/:id', updateLabourAssignment);
router.delete('/labour-assignments/:id', deleteLabourAssignment);

export default router;
import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;

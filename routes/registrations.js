const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const multer = require('multer');

// Use memory storage — works on Vercel serverless
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET all registrations
router.get('/', async (req, res) => {
    try {
        const regs = await Registration.find().sort({ createdAt: -1 });
        res.json(regs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// POST new registration
router.post('/', upload.single('screenshot'), async (req, res) => {
    try {
        const formData = { ...req.body };
        if (req.file) {
            const base64 = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype || 'image/jpeg';
            formData.screenshotUrl = `data:${mimeType};base64,${base64}`;
        }
        const newReg = new Registration(formData);
        await newReg.save();
        res.status(201).json(newReg);
    } catch (error) {
        res.status(500).json({ message: 'Error saving registration', error: error.message });
    }
});

// ⚠️ MUST be BEFORE /:id routes — otherwise Express matches "actions" as an ID
// CLEAR ALL registrations
router.delete('/actions/clear', async (req, res) => {
    try {
        await Registration.deleteMany({});
        res.json({ message: 'All registrations cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing registrations', error: error.message });
    }
});

// GET stats summary  (also before /:id)
router.get('/stats', async (req, res) => {
    try {
        const total = await Registration.countDocuments();
        const verified = await Registration.countDocuments({ status: 'VERIFIED' });
        res.json({
            registered: total,
            verified,
            pending: total - verified,
            slotsLeft: Math.max(0, 32 - total),
            players: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// PATCH - verify / update status
router.patch('/:id', async (req, res) => {
    try {
        const updated = await Registration.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Registration not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating registration', error: error.message });
    }
});

// DELETE a single registration
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Registration.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Registration not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting registration', error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
            formData.screenshotUrl = '/uploads/' + req.file.filename;
        }
        const newReg = new Registration(formData);
        await newReg.save();
        res.status(201).json(newReg);
    } catch (error) {
        res.status(500).json({ message: 'Error saving registration', error: error.message });
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
// CLEAR ALL registrations
router.delete('/actions/clear', async (req, res) => {
    try {
        await Registration.deleteMany({});
        res.json({ message: 'All registrations cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing registrations', error: error.message });
    }
});

// DELETE a registration
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Registration.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Registration not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting registration', error: error.message });
    }
});

// GET stats summary
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

module.exports = router;

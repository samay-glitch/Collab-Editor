const { Router } = require('express');
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

module.exports = router;

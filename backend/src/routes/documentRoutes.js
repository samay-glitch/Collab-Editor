const { Router } = require('express');
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  addCollaborator,
} = require('../controllers/documentController');
const { createDocValidator, updateDocValidator } = require('../validators/documentValidator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

router.post('/', createDocValidator, validate, createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocValidator, validate, updateDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/collaborators', addCollaborator);

module.exports = router;

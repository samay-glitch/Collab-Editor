const documentService = require('../services/documentService');
const asyncHandler = require('../utils/asyncHandler');

const createDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const doc = await documentService.createDocument(title, req.user._id);

  res.status(201).json({
    success: true,
    data: doc,
  });
});

const getDocuments = asyncHandler(async (req, res) => {
  const docs = await documentService.getDocumentsByUser(req.user._id);

  res.json({
    success: true,
    data: docs,
  });
});

const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await documentService.getDocumentById(req.params.id, req.user._id);

  res.json({
    success: true,
    data: doc,
  });
});

const updateDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.updateDocument(req.params.id, req.body, req.user._id);

  res.json({
    success: true,
    data: doc,
  });
});

const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id, req.user._id);

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
});

const addCollaborator = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await documentService.addCollaborator(req.params.id, email, req.user._id);

  res.json({
    success: true,
    message: 'Collaborator added successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  addCollaborator,
};

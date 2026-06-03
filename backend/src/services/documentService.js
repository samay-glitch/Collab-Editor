const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');

const createDocument = async (title, ownerId) => {
  return Document.create({
    title: title || 'Untitled Document',
    owner: ownerId,
    collaborators: [],
  });
};

const getDocumentsByUser = async (userId) => {
  return Document.find({
    $or: [{ owner: userId }, { collaborators: userId }],
  }).populate('owner', 'name email avatar').sort({ updatedAt: -1 });
};

const getDocumentById = async (docId, userId) => {
  const doc = await Document.findById(docId)
    .populate('owner', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .populate('lastEditedBy', 'name email avatar');

  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  const userIdStr = userId.toString();
  if (!doc.isPublic && doc.owner._id.toString() !== userIdStr && !doc.collaborators.some(c => c._id.toString() === userIdStr)) {
    throw ApiError.forbidden('You do not have access to this document');
  }

  return doc;
};

const updateDocument = async (docId, updateData, userId) => {
  const doc = await Document.findById(docId);
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  const userIdStr = userId.toString();
  if (doc.owner.toString() !== userIdStr && !doc.collaborators.some(id => id.toString() === userIdStr)) {
    throw ApiError.forbidden('You do not have permission to edit this document');
  }

  if (updateData.title !== undefined) doc.title = updateData.title;
  if (updateData.content !== undefined) doc.content = updateData.content;
  if (updateData.isPublic !== undefined) doc.isPublic = updateData.isPublic;
  
  doc.lastEditedBy = userId;
  doc.version += 1;

  const savedDoc = await doc.save();
  await savedDoc.populate('lastEditedBy', 'name email avatar');
  return savedDoc;
};

const deleteDocument = async (docId, userId) => {
  const doc = await Document.findById(docId);
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  if (doc.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the owner can delete this document');
  }

  await Document.deleteOne({ _id: docId });
  return { success: true };
};

const addCollaborator = async (docId, email, userId) => {
  const User = require('../models/User');
  const doc = await Document.findById(docId);
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  if (doc.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the owner can invite collaborators');
  }

  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    throw ApiError.notFound('User with this email not found');
  }

  if (userToInvite._id.toString() === doc.owner.toString()) {
    throw ApiError.badRequest('You are already the owner of this document');
  }

  if (doc.collaborators.some(id => id.toString() === userToInvite._id.toString())) {
    throw ApiError.conflict('User is already a collaborator');
  }

  doc.collaborators.push(userToInvite._id);
  await doc.save();

  return userToInvite;
};

module.exports = {
  createDocument,
  getDocumentsByUser,
  getDocumentById,
  updateDocument,
  deleteDocument,
  addCollaborator,
};

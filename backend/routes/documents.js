const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  uploadMiddleware,
  uploadDocument,
  getDocuments,
  deleteDocument,
  signDocument
} = require('../controllers/documentController');

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload, management & e-signature
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 */
router.post('/upload', protect, uploadMiddleware, uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents for current user
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', protect, deleteDocument);

/**
 * @swagger
 * /api/documents/{id}/sign:
 *   post:
 *     summary: Add e-signature to a document
 *     tags: [Documents]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [signature]
 *             properties:
 *               signature: { type: string, description: "Base64 encoded signature image" }
 */
router.post('/:id/sign', protect, signDocument);

module.exports = router;

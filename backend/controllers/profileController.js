const Profile = require('../models/Profile');

// GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile)
      return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/profile/me
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'bio', 'location', 'website',
      'startupName', 'startupHistory', 'fundingNeeded',
      'investmentHistory', 'investmentPreferences', 'portfolioSize'
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/profile/:userId  (view other profiles)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email role');
    if (!profile)
      return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/profile  (List all profiles for dropdowns)
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', 'name email role');
    console.log(`[Discovery] Found ${profiles.length} total profiles (excluding self)`);
    profiles.forEach(p => {
      if (p.user) {
        console.log(`- Profile: ${p.user.name} Role: ${p.user.role}`);
      } else {
        console.log(`- Profile ID: ${p._id} HAS NO LINKED USER!`);
      }
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Avatar Upload Section ────────────────────────────────────────

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueName = `avatar-${req.user.id}-${timestamp}${path.extname(file.originalname)}`;
    console.log(`Generating filename for upload: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// POST /api/profile/me/avatar
exports.uploadAvatar = (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      console.error('Multer file processing error:', err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      console.error('Upload failed: No file provided in request');
      return res.status(400).json({ message: 'No file provided' });
    }

    try {
      if (!req.file) {
        console.error('Upload failed: req.file is undefined');
        return res.status(400).json({ message: 'No file provided' });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      console.log(`[AvatarUpload] Success. Path: ${avatarUrl}, User: ${req.user.id}`);
      
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: { avatar: avatarUrl } },
        { new: true, upsert: true }
      );

      if (!profile) {
        throw new Error('Could not find or create profile after upload');
      }

      res.json({ 
        success: true, 
        avatarUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${avatarUrl}`
      });
    } catch (dbError) {
      console.error('[AvatarUpload] Error during DB update:', dbError);
      res.status(500).json({ 
        message: 'Database update failed', 
        error: dbError.message 
      });
    }
  });
};
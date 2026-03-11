const Meeting = require('../models/Meeting');

// POST /api/meetings — create a meeting with conflict detection
exports.createMeeting = async (req, res) => {
  try {
    const { attendeeId, title, description, startTime, endTime, meetingLink, notes } = req.body;
    const hostId = req.user.id;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Conflict detection: check BOTH host and attendee have no overlapping meetings
    const hostConflict = await Meeting.findOne({
      $and: [
        { $or: [{ host: hostId }, { attendee: hostId }] },
        { status: { $in: ['pending', 'accepted'] } },
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (hostConflict) {
      return res.status(409).json({ message: 'You have a conflicting meeting at that time' });
    }

    const attendeeConflict = await Meeting.findOne({
      $and: [
        { $or: [{ host: attendeeId }, { attendee: attendeeId }] },
        { status: { $in: ['pending', 'accepted'] } },
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (attendeeConflict) {
      return res.status(409).json({ message: 'The attendee has a conflicting meeting at that time' });
    }

    const meeting = await Meeting.create({
      host: hostId,
      attendee: attendeeId,
      title,
      description,
      startTime: start,
      endTime: end,
      meetingLink,
      notes
    });

    const populated = await meeting.populate([
      { path: 'host', select: 'name email role' },
      { path: 'attendee', select: 'name email role' }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/meetings — list all meetings for the current user
exports.getMyMeetings = async (req, res) => {
  try {
    const userId = req.user.id;
    const meetings = await Meeting.find({
      $or: [{ host: userId }, { attendee: userId }]
    })
      .populate('host', 'name email role')
      .populate('attendee', 'name email role')
      .sort({ startTime: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/meetings/:id/status — accept, reject, or cancel
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Only attendee can accept/reject; host or attendee can cancel
    if (status === 'accepted' || status === 'rejected') {
      if (meeting.attendee.toString() !== userId) {
        return res.status(403).json({ message: 'Only the attendee can accept or reject' });
      }
    } else if (status === 'cancelled') {
      if (meeting.host.toString() !== userId && meeting.attendee.toString() !== userId) {
        return res.status(403).json({ message: 'Only participants can cancel' });
      }
    }

    meeting.status = status;
    await meeting.save();

    const populated = await meeting.populate([
      { path: 'host', select: 'name email role' },
      { path: 'attendee', select: 'name email role' }
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/meetings/:id — delete a meeting (host only)
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    if (meeting.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can delete this meeting' });
    }

    await meeting.deleteOne();
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Note = require('../models/Note');
const appEvents = require('../events/appEvents');

// Users touch only their own notes; admins can access any note
const accessFilter = (req, id) => (req.user.role === 'admin' ? { _id: id } : { _id: id, owner: req.user._id });

// POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const note = await Note.create({ title, content, owner: req.user._id });
    appEvents.emit('note:created', note);
    res.status(201).json({ success: true, note });
  } catch (err) { next(err); }
};

// GET /api/notes   (admin: ?all=true returns everyone's notes)
exports.getNotes = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { owner: req.user._id };
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: notes.length, notes });
  } catch (err) { next(err); }
};

// GET /api/notes/:id
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne(accessFilter(req, req.params.id));
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (err) { next(err); }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    const note = await Note.findOneAndUpdate(accessFilter(req, req.params.id), update, {
      new: true, runValidators: true,
    });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    appEvents.emit('note:updated', note);
    res.json({ success: true, note });
  } catch (err) { next(err); }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete(accessFilter(req, req.params.id));
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    appEvents.emit('note:deleted', note._id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

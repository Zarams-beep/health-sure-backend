import Note from '../models/note.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Notes for a User
 */
export const updateNotes = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId } = req.params;
    const { doctorNotes, caregiverComments } = req.body;

    // 🔍 Step 1: Validate that user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Step 2: Validate doctorNotes is an array if provided
    if (doctorNotes && !Array.isArray(doctorNotes)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'doctorNotes must be an array'
      });
    }

    // 🔁 Step 3: Create or update the note entry
    const existingNote = await Note.findOne({ where: { userId }, transaction });

    const note = existingNote
      ? await existingNote.update({ doctorNotes, caregiverComments }, { transaction })
      : await Note.create({ userId, doctorNotes, caregiverComments }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingNote ? 'Notes updated successfully' : 'Notes created successfully',
      data: note
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Notes update error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * 📥 Get Notes for a User
 */
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 Step 1: Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 📦 Step 2: Fetch note data
    const note = await Note.findOne({ where: { userId } });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'No notes found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes',
      error: error.message
    });
  }
};

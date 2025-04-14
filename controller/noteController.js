import Note from '../models/note.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

export const updateNotes = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;
    const { doctorNotes, caregiverComments } = req.body;

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate array format
    if (doctorNotes && !Array.isArray(doctorNotes)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'doctorNotes must be an array'
      });
    }

    // Check if notes already exist
    const existingNotes = await Note.findOne({ where: { userId }, transaction });

    let notes;
    if (existingNotes) {
      await existingNotes.update({
        doctorNotes,
        caregiverComments
      }, { transaction });

      notes = existingNotes;
    } else {
      notes = await Note.create({
        userId,
        doctorNotes,
        caregiverComments
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingNotes ? 'Notes updated successfully' : 'Notes created successfully',
      data: notes
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Notes update error:', error);

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

import Note from '../models/note.js';
import User from '../models/user.js';

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

    // Validate array formats
    if (doctorNotes && !Array.isArray(doctorNotes)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'doctorNotes must be an array'
      });
    }

    const [notes, created] = await Note.upsert({
      userId,
      doctorNotes,
      caregiverComments
    }, {
      transaction,
      returning: true,
      conflictFields: ['userId']
    });

    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: created ? 'Notes created' : 'Notes updated',
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
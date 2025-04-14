import MedicalHistory from '../models/medicalHistory.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

export const updateMedicalHistory = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;
    const { pastDiagnoses, surgeries, medications, familyHistory } = req.body;

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate medications structure
    if (medications && !Array.isArray(medications)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Medications must be an array'
      });
    }

    if (medications && !medications.every(m => m.name && m.dosage)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Each medication must include name and dosage'
      });
    }

    // Check if medical history exists
    const existingHistory = await MedicalHistory.findOne({ where: { userId }, transaction });

    let medicalHistory;

    if (existingHistory) {
      await existingHistory.update({
        pastDiagnoses,
        surgeries,
        medications,
        familyHistory
      }, { transaction });

      medicalHistory = existingHistory;
    } else {
      medicalHistory = await MedicalHistory.create({
        userId,
        pastDiagnoses,
        surgeries,
        medications,
        familyHistory
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingHistory ? 'Medical history updated successfully' : 'Medical history created successfully',
      data: medicalHistory
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Medical history error:', error);

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

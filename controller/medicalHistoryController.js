import MedicalHistory from '../models/medicalHistory.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Medical History
 */
export const updateMedicalHistory = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId } = req.params;
    const { pastDiagnoses, surgeries, medications, familyHistory } = req.body;

    // 🔍 Step 1: Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 💊 Step 2: Validate medications format
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
        message: 'Each medication must include a name and dosage'
      });
    }

    // 🔁 Step 3: Create or update medical history
    const existingHistory = await MedicalHistory.findOne({ where: { userId }, transaction });

    const medicalHistory = existingHistory
      ? await existingHistory.update({ pastDiagnoses, surgeries, medications, familyHistory }, { transaction })
      : await MedicalHistory.create({ userId, pastDiagnoses, surgeries, medications, familyHistory }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingHistory ? 'Medical history updated successfully' : 'Medical history created successfully',
      data: medicalHistory
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Medical history error:', error);

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
 * 📥 Get Medical History
 */
export const getMedicalHistory = async (req, res) => {
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

    // 📦 Step 2: Fetch medical history
    const medicalHistory = await MedicalHistory.findOne({ where: { userId } });

    if (!medicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Medical history not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: medicalHistory
    });

  } catch (error) {
    console.error('❌ Error fetching medical history:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical history',
      error: error.message
    });
  }
};

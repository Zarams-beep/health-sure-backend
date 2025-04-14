import HealthStatus from '../models/healthStatus.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

export const updateHealthStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;

    const {
      healthCondition,
      bloodPressure,
      heartRate,
      temperature,
      sugar,
      oxygen,
      cholesterol,
      BMI,
      allergies
    } = req.body;

    // Validate required fields
    if (!healthCondition || !bloodPressure) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'healthCondition and bloodPressure are required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if HealthStatus exists
    const existingStatus = await HealthStatus.findOne({ where: { userId }, transaction });

    const safeParseFloat = (val) => val !== undefined && val !== '' ? parseFloat(val) : null;

    let healthStatus;
    if (existingStatus) {
      // Update existing
      await existingStatus.update({
        healthCondition,
        bloodPressure: safeParseFloat(bloodPressure),
        heartRate: safeParseFloat(heartRate),
        temperature: safeParseFloat(temperature),
        sugar: safeParseFloat(sugar),
        oxygen: safeParseFloat(oxygen),
        cholesterol: safeParseFloat(cholesterol),
        BMI: safeParseFloat(BMI),
        allergies: allergies || []
      }, { transaction });

      healthStatus = existingStatus;
    } else {
      // Create new
      healthStatus = await HealthStatus.create({
        userId,
        healthCondition,
        bloodPressure: safeParseFloat(bloodPressure),
        heartRate: safeParseFloat(heartRate),
        temperature: safeParseFloat(temperature),
        sugar: safeParseFloat(sugar),
        oxygen: safeParseFloat(oxygen),
        cholesterol: safeParseFloat(cholesterol),
        BMI: safeParseFloat(BMI),
        allergies: allergies || []
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingStatus ? 'Health status updated successfully' : 'Health status created successfully',
      data: healthStatus
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Health status update error:', error);

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

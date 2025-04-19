import HealthStatus from '../models/healthStatus.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Health Status
 */
export const updateHealthStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId } = req.params;

    const {
      healthCondition,
      vitalSigns = {},
      allergies = []
    } = req.body;

    const {
      bloodPressure,
      heartRate,
      temperature,
      sugar,
      oxygen,
      cholesterol,
      BMI
    } = vitalSigns;

    // ✅ Step 1: Basic Validation
    if (!healthCondition || bloodPressure === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'healthCondition and bloodPressure are required'
      });
    }

    // 🔍 Step 2: Verify user existence
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔁 Step 3: Update or Create health status
    const existingStatus = await HealthStatus.findOne({ where: { userId }, transaction });

    const vitalData = {
      healthCondition,
      bloodPressure,
      heartRate,
      temperature,
      sugar,
      oxygen,
      cholesterol,
      BMI,
      allergies
    };

    const healthStatus = existingStatus
      ? await existingStatus.update(vitalData, { transaction })
      : await HealthStatus.create({ userId, ...vitalData }, { transaction });

    await transaction.commit();

    // ✅ Step 4: Send response
    res.status(200).json({
      success: true,
      message: existingStatus ? 'Health status updated successfully' : 'Health status created successfully',
      data: healthStatus
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Health status update error:', error);

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
 * 📥 Get Health Status
 */
export const getHealthStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 Step 1: Confirm user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 📦 Step 2: Fetch health status
    const healthStatus = await HealthStatus.findOne({ where: { userId } });

    if (!healthStatus) {
      return res.status(404).json({
        success: false,
        message: 'Health status not found for this user',
      });
    }

    // ✅ Step 3: Send data
    res.status(200).json({
      success: true,
      data: healthStatus,
    });

  } catch (error) {
    console.error('❌ Error fetching health status:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching health status',
      error: error.message,
    });
  }
};

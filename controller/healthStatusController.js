import HealthStatus from '../models/healthStatus.js';
import User from '../models/user.js';

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

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upsert health status
    const [healthStatus, created] = await HealthStatus.upsert({
      userId,
      healthCondition,
      bloodPressure: parseFloat(bloodPressure),
      heartRate: parseFloat(heartRate),
      temperature: parseFloat(temperature),
      sugar: parseFloat(sugar),
      oxygen: parseFloat(oxygen),
      cholesterol: parseFloat(cholesterol),
      BMI: parseFloat(BMI),
      allergies: allergies || []
    }, {
      transaction,
      returning: true,
      conflictFields: ['userId']
    });

    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: created ? 'Health status created' : 'Health status updated',
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
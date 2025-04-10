import TreatmentInfo from '../models/treatmentInfo.js';
import User from '../models/user.js';

export const updateTreatmentInfo = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.params.userId;
    const { assignedDoctor, treatmentPlans, upcomingAppointments } = req.body;

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate assigned doctor structure
    if (assignedDoctor && !assignedDoctor.name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Doctor name is required'
      });
    }

    // Process appointments
    const processedAppointments = upcomingAppointments?.map(appt => ({
      ...appt,
      date: new Date(appt.date)
    })) || [];

    const [treatmentInfo, created] = await TreatmentInfo.upsert({
      userId,
      assignedDoctor,
      treatmentPlans,
      upcomingAppointments: processedAppointments
    }, {
      transaction,
      returning: true,
      conflictFields: ['userId']
    });

    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: created ? 'Treatment info created' : 'Treatment info updated',
      data: treatmentInfo
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Treatment info error:', error);
    
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
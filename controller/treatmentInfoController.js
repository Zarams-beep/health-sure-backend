import TreatmentInfo from '../models/treatmentInfo.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

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

    // Normalize upcoming appointment dates
    const processedAppointments = Array.isArray(upcomingAppointments)
      ? upcomingAppointments.map(appt => ({
          ...appt,
          date: new Date(appt.date)
        }))
      : [];

    // Check for existing treatment info
    const existingInfo = await TreatmentInfo.findOne({ where: { userId }, transaction });

    let treatmentInfo;
    if (existingInfo) {
      await existingInfo.update({
        assignedDoctor,
        treatmentPlans,
        upcomingAppointments: processedAppointments
      }, { transaction });

      treatmentInfo = existingInfo;
    } else {
      treatmentInfo = await TreatmentInfo.create({
        userId,
        assignedDoctor,
        treatmentPlans,
        upcomingAppointments: processedAppointments
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingInfo ? 'Treatment info updated successfully' : 'Treatment info created successfully',
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

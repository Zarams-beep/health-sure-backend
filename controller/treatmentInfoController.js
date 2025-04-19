import TreatmentInfo from '../models/treatmentInfo.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Treatment Info for a User
 */
export const updateTreatmentInfo = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId } = req.params;
    const { assignedDoctor, treatmentPlans, upcomingAppointments } = req.body;

    // 🔍 Step 1: Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Step 2: Validate assigned doctor
    if (assignedDoctor && (!assignedDoctor.name || typeof assignedDoctor.name !== 'string')) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Assigned doctor must include a valid name'
      });
    }

    // 🗓️ Step 3: Normalize upcoming appointment dates
    const processedAppointments = Array.isArray(upcomingAppointments)
      ? upcomingAppointments.map(appt => ({
          ...appt,
          date: appt.date ? new Date(appt.date) : null
        }))
      : [];

    // 🔁 Step 4: Create or update treatment info
    const existingInfo = await TreatmentInfo.findOne({ where: { userId }, transaction });

    const treatmentInfo = existingInfo
      ? await existingInfo.update({
          assignedDoctor,
          treatmentPlans,
          upcomingAppointments: processedAppointments
        }, { transaction })
      : await TreatmentInfo.create({
          userId,
          assignedDoctor,
          treatmentPlans,
          upcomingAppointments: processedAppointments
        }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingInfo ? 'Treatment info updated successfully' : 'Treatment info created successfully',
      data: treatmentInfo
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Treatment info update error:', error);

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
 * 📥 Get Treatment Info for a User
 */
export const getTreatmentInfo = async (req, res) => {
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

    // 📦 Step 2: Fetch treatment info
    const treatmentInfo = await TreatmentInfo.findOne({ where: { userId } });

    if (!treatmentInfo) {
      return res.status(404).json({
        success: false,
        message: 'No treatment info found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: treatmentInfo
    });

  } catch (error) {
    console.error('❌ Error fetching treatment info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching treatment info',
      error: error.message
    });
  }
};

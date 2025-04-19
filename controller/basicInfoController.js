import BasicInfo from '../models/basicInfo.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Basic Info
 */
export const updateBasicInfo = async (req, res) => {
  const transaction = await sequelize.transaction();
  console.log("🚀 Starting DB transaction for Basic Info");

  try {
    const { userId } = req.params;
    const {
      fullName,
      DOB,
      Age,
      Gender,
      phoneNumber,
      email,
      HouseAddress,
      EmergencyNumber,
      NextOfKinName,
      NextOfKinGender,
      NextOfKinPhoneNumber,
      NextOfKinEmailAddress
    } = req.body;

    // ✅ Step 1: Validation
    if (!fullName || !DOB || !Gender) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, DOB, and Gender are mandatory'
      });
    }

    // 🔍 Step 2: Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔁 Step 3: Check if BasicInfo exists, then update or create
    const existingInfo = await BasicInfo.findOne({ where: { userId }, transaction });

    const infoPayload = {
      userId,
      fullName,
      DOB: new Date(DOB),
      Age: parseInt(Age),
      Gender,
      phoneNumber,
      email,
      HouseAddress,
      EmergencyNumber,
      NextOfKinName,
      NextOfKinGender,
      NextOfKinPhoneNumber,
      NextOfKinEmailAddress
    };

    const basicInfo = existingInfo
      ? await existingInfo.update(infoPayload, { transaction })
      : await BasicInfo.create(infoPayload, { transaction });

    await transaction.commit();

    // ✅ Step 4: Response
    res.status(200).json({
      success: true,
      message: existingInfo ? 'Basic info updated successfully' : 'Basic info created successfully',
      data: basicInfo
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error updating basic info:', error);

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
 * 📥 Get Basic Info
 */
export const getBasicInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 Step 1: Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 📦 Step 2: Find basic info
    const basicInfo = await BasicInfo.findOne({ where: { userId } });

    if (!basicInfo) {
      return res.status(404).json({
        success: false,
        message: 'Basic info not found for this user',
      });
    }

    // ✅ Step 3: Send response
    res.status(200).json({
      success: true,
      data: basicInfo,
    });

  } catch (error) {
    console.error('❌ Error fetching basic info:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching basic info',
      error: error.message,
    });
  }
};

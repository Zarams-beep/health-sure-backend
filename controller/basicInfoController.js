// controllers/basicInfoController.js
import BasicInfo from '../models/basicInfo.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

export const updateBasicInfo = async (req, res) => {
  console.log("Starting DB transaction");
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;
    console.log("User ID:", userId);

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

    // Validate required fields
    if (!fullName || !DOB || !Gender) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, DOB, and Gender are mandatory'
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

    // Check if BasicInfo exists for the user
    const existingInfo = await BasicInfo.findOne({ where: { userId }, transaction });

    let basicInfo;
    if (existingInfo) {
      // Update existing
      await existingInfo.update({
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
      }, { transaction });

      basicInfo = existingInfo;
    } else {
      // Create new
      basicInfo = await BasicInfo.create({
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
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingInfo ? 'Basic info updated successfully' : 'Basic info created successfully',
      data: basicInfo
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in basic info update:', error);

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

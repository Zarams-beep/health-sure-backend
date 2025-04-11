// controllers/basicInfoController.js
import BasicInfo from '../models/basicInfo.js';
import User from '../models/user.js';

export const updateBasicInfo = async (req, res) => {
  console.log("Starting DB transaction");
  const transaction = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    timeout: 10000 // 10 second timeout
  });
  console.log("Upserting basic info...");
  try {
    const userId = req.params.userId;
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

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upsert basic info
    const [basicInfo, created] = await BasicInfo.upsert({
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
    }, {
      transaction,
      returning: true,
      conflictFields: ['userId']
    });

    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: created ? 'Basic info created successfully' : 'Basic info updated successfully',
      data: basicInfo
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in basic info update:', error);
    
    // Handle Sequelize validation errors
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
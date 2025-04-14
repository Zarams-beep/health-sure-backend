import LabResult from '../models/labResult.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

export const updateLabResults = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;
    const { testResults, medicalReports } = req.body;

    // Validate user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate testResults format if provided
    if (testResults && !Array.isArray(testResults)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'testResults must be an array'
      });
    }

    // Format testResults dates if provided
    const formattedTestResults = testResults?.map(t => ({
      ...t,
      date: new Date(t.date)
    })) || [];

    // Check if LabResult exists
    const existingResult = await LabResult.findOne({ where: { userId }, transaction });

    let labResult;

    if (existingResult) {
      await existingResult.update({
        testResults: formattedTestResults,
        medicalReports
      }, { transaction });

      labResult = existingResult;
    } else {
      labResult = await LabResult.create({
        userId,
        testResults: formattedTestResults,
        medicalReports
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingResult ? 'Lab results updated successfully' : 'Lab results created successfully',
      data: labResult
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Lab results error:', error);

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

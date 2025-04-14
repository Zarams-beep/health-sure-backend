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
        message: 'User not found',
      });
    }

    // Check if at least one field is being updated
    if (!testResults && !medicalReports) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nothing to update. Provide at least testResults or medicalReports.',
      });
    }

    // Validate testResults format
    if (testResults) {
      if (!Array.isArray(testResults)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'testResults must be an array',
        });
      }

      // Validate dates inside testResults
      for (const t of testResults) {
        if (!t.date || isNaN(Date.parse(t.date))) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Invalid or missing date format in test result: ${t.testName || 'Unknown Test'}`,
          });
        }
      }
    }

    // Validate medicalReports format
    if (medicalReports && !Array.isArray(medicalReports)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'medicalReports must be an array',
      });
    }

    // Format testResults dates if provided
    const formattedTestResults = testResults?.map((t) => ({
      ...t,
      date: new Date(t.date),
    }));

    // Check if LabResult exists
    const existingResult = await LabResult.findOne({
      where: { userId },
      transaction,
    });

    let labResult;

    const dataToSave = {
      userId,
      ...(formattedTestResults ? { testResults: formattedTestResults } : {}),
      ...(medicalReports ? { medicalReports } : {}),
    };

    if (existingResult) {
      await existingResult.update(dataToSave, { transaction });
      labResult = existingResult;
    } else {
      labResult = await LabResult.create(dataToSave, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingResult
        ? 'Lab results updated successfully'
        : 'Lab results created successfully',
      data: labResult,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Lab results error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

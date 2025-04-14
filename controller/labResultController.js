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

    // Early return if no data to update
    if (!testResults && !medicalReports) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No data provided to update',
      });
    }

    // Prepare data for saving
    const dataToSave = {
      userId,
      ...(testResults && { 
        testResults: testResults
          .filter(t => t.testName || t.result || t.date) // Filter out empty entries
          .map(t => ({
            ...t,
            ...(t.date && { date: new Date(t.date) }) // Format date if exists
          }))
      }),
      ...(medicalReports && { 
        medicalReports: medicalReports.filter(r => r.title || r.url) // Filter out empty entries
      })
    };

    // Find or create lab result
    const [labResult, created] = await LabResult.findOrCreate({
      where: { userId },
      defaults: dataToSave,
      transaction
    });

    if (!created) {
      await labResult.update(dataToSave, { transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: created ? 'Lab results created successfully' : 'Lab results updated successfully',
      data: labResult
    });

  } catch (error) {
    await transaction.rollback();
    
    console.error('Error processing lab results:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    // Handle invalid date format
    if (error.message.includes('Invalid date')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
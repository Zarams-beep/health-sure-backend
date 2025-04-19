import LabResult from '../models/labResult.js';
import User from '../models/user.js';
import { sequelize } from '../config/db.js';

/**
 * 📤 Create or Update Lab Results
 */
export const updateLabResults = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId } = req.params;
    const { testResults, medicalReports } = req.body;

    // 🔍 Step 1: Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🧪 Step 2: Clean up test results
    const processedTestResults = testResults?.map(test => ({
      testName: test.testName || '',
      result: test.result || '',
      date: test.date === "none" || !test.date ? '' : new Date(test.date).toISOString()
    }));

    // 📄 Step 3: Clean up medical reports
    const processedMedicalReports = medicalReports?.map(report => ({
      title: report.title || '',
      url: report.url || ''
    }));

    // 🔁 Step 4: Create or update lab record
    const existingLabResults = await LabResult.findOne({ 
      where: { userId }, 
      transaction 
    });

    const labResult = existingLabResults
      ? await existingLabResults.update({
          testResults: processedTestResults,
          medicalReports: processedMedicalReports
        }, { transaction })
      : await LabResult.create({
          userId,
          testResults: processedTestResults,
          medicalReports: processedMedicalReports
        }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: existingLabResults ? 'Lab results updated successfully' : 'Lab results created successfully',
      data: labResult
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Lab results update error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.message.includes('Invalid date')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format or "none"'
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
 * 📥 Get Lab Results
 */
export const getLabResults = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 Step 1: Confirm user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 📦 Step 2: Fetch lab results
    const labResult = await LabResult.findOne({ where: { userId } });

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab results not found for this user'
      });
    }

    // ✅ Step 3: Respond with data
    res.status(200).json({
      success: true,
      data: labResult
    });

  } catch (error) {
    console.error('❌ Error fetching lab results:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab results',
      error: error.message
    });
  }
};

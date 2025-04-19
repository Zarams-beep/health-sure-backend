import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const LabResult = sequelize.define('LabResult', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  testResults: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isValidTestResults(value) {
        if (!Array.isArray(value)) {
          throw new Error('testResults must be an array');
        }
        value.forEach(test => {
          if (test.testName === undefined || test.testName === null) {
            throw new Error('testName is required');
          }
          if (test.result === undefined || test.result === null) {
            throw new Error('result is required');
          }
          if (test.date === undefined || test.date === null) {
            throw new Error('date is required');
          }
        });
      }
    }
  },
  medicalReports: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isValidMedicalReports(value) {
        if (!Array.isArray(value)) {
          throw new Error('medicalReports must be an array');
        }
        value.forEach(report => {
          if (report.title === undefined || report.title === null) {
            throw new Error('title is required');
          }
          if (report.url === undefined || report.url === null) {
            throw new Error('url is required');
          }
        });
      }
    }
  }
}, {
  freezeTableName: true,
  timestamps: true,
  hooks: {
    beforeSave: (labResult) => {
      // Convert "none" to empty string
      if (labResult.testResults) {
        labResult.testResults = labResult.testResults.map(test => ({
          testName: test.testName?.toLowerCase() === "none" ? "" : test.testName,
          result: test.result?.toLowerCase() === "none" ? "" : test.result,
          date: test.date?.toLowerCase() === "none" ? "" : test.date
        }));
      }
      if (labResult.medicalReports) {
        labResult.medicalReports = labResult.medicalReports.map(report => ({
          title: report.title?.toLowerCase() === "none" ? "" : report.title,
          url: report.url?.toLowerCase() === "none" ? "" : report.url
        }));
      }
    }
  }
});

LabResult.associate = function(models) {
  LabResult.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default LabResult;
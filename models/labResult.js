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
    defaultValue: []
  },
  medicalReports: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  freezeTableName: true,
  timestamps: true
});

LabResult.associate = function(models) {
  LabResult.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default LabResult;
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const MedicalHistory = sequelize.define('MedicalHistory', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  pastDiagnoses: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  surgeries: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  medications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  familyHistory: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  freezeTableName: true,
  timestamps: true
});

MedicalHistory.associate = function(models) {
  MedicalHistory.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default MedicalHistory;
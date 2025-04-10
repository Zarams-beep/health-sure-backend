import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const HealthStatus = sequelize.define('HealthStatus', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  healthCondition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bloodPressure: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  heartRate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  sugar: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  oxygen: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cholesterol: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  BMI: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  freezeTableName: true,
  timestamps: true
});

// Association
HealthStatus.associate = function(models) {
  HealthStatus.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default HealthStatus;
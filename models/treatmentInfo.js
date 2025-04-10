import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TreatmentInfo = sequelize.define('TreatmentInfo', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedDoctor: {
    type: DataTypes.JSONB,
    defaultValue: {
      name: null,
      specialization: null,
      contact: null
    }
  },
  treatmentPlans: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  upcomingAppointments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  freezeTableName: true,
  timestamps: true
});

TreatmentInfo.associate = function(models) {
  TreatmentInfo.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default TreatmentInfo;
// models/basicInfo.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const BasicInfo = sequelize.define('BasicInfo', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: { 
        tableName: 'Users', // Must match exactly
        schema: 'public'
      },
      key: 'id'
    }
  },
  fullName: DataTypes.STRING,
  DOB: DataTypes.DATEONLY,
  Age: DataTypes.INTEGER,
  Gender: DataTypes.ENUM('Male', 'Female', 'Other'),
  phoneNumber: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true }
  },
  HouseAddress: DataTypes.STRING,
  EmergencyNumber: DataTypes.STRING,
  NextOfKinName: DataTypes.STRING,
  NextOfKinGender: DataTypes.ENUM('Male', 'Female', 'Other'),
  NextOfKinPhoneNumber: DataTypes.STRING,
  NextOfKinEmailAddress: {
    type: DataTypes.STRING,
    validate: { isEmail: true }
  }
}, {
  freezeTableName: true, // Prevent pluralization
  timestamps: true
});

// Association
BasicInfo.associate = function(models) {
  BasicInfo.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default BasicInfo;
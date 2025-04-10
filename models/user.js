import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, { 
    timestamps: true,
    modelName: 'User',
    tableName: 'users' // Explicit table name
});

// associates
User.associate = (models) => {
  User.hasOne(models.BasicInfo, { foreignKey: 'userId', as: 'basicInfo' });
  User.hasOne(models.HealthStatus, { foreignKey: 'userId', as: 'healthStatus' });
  User.hasOne(models.LabResult, { foreignKey: 'userId', as: 'labResult' });
  User.hasOne(models.MedicalHistory, { foreignKey: 'userId', as: 'medicalHistory' });
  User.hasOne(models.TreatmentInfo, { foreignKey: 'userId', as: 'treatmentInfo' });
  User.hasOne(models.Note, { foreignKey: 'userId', as: 'note' });
};
export default User;
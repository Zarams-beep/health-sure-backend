import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from "bcrypt";

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
    tableName: 'Users',
    hooks:{
        beforeCreate: async (user) =>{
            if(user.fullName) user.fullName = useReducer.fullName.toLowerCase();
            user.email = user.email.toLowerCase();

            if (user.password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) =>{
            if (user.changed("fullName")){
                user.fullName = user.fullName.toLowerCase();
            }
            if (user.changed("email")) {
          user.email = user.email.toLowerCase();
        }
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        } 
        }
    }, 
    indexes:[
        {
            unique: true,
            fields:["id"],
        },
        {
            unique:true,
            fields:["fullName"],
        },
        {
         unique:true,
         fields:["email"],
        }
       
        
    ]
});

User.prototype.verifyPassword = async function (password){
    return await bcrypt.compare(password, this.password);
};


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
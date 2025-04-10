import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Note = sequelize.define('Note', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorNotes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  caregiverComments: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  }
}, {
  freezeTableName: true,
  timestamps: true
});

Note.associate = function(models) {
  Note.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

export default Note;
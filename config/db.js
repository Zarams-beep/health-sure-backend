import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: `${process.env.DB_HOST}.singapore-postgres.render.com`,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    define: {  // 👈 Added critical case-sensitivity config
      freezeTableName: true,
      quoteIdentifiers: true, // Preserve case
      schema: 'public',
      underscored: false
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Verify connection with case-sensitive query
    const [result] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'Users'`
    );
    
    console.log("✅ PostgreSQL Connected. Users table exists:", result.length > 0);
  } catch (error) {
    console.error("❌ Connection Failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
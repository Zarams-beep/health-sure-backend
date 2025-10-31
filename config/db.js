import { Sequelize } from "sequelize";
import config from "./index.js";

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: `${config.DB_HOST}.singapore-postgres.render.com`,
    port: config.DB_PORT,
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
    logging:false,
   // logging: (msg) => console.log(msg),
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
    
  } catch (error) {
    console.error("❌ Connection Failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
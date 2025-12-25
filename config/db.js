import { Sequelize } from "sequelize";
import config from "./index.js";
import process from "node:process";

// Use DATABASE_URL if available, otherwise fall back to individual variables
const sequelize = config.DATABASE_URL
  ? new Sequelize(config.DATABASE_URL, {
      dialect: "postgres",
      logging: config.ENVIRONMENT === "development" ? console.log : false,
      
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Required for cloud databases like Neon
        }
      },

      define: {
        freezeTableName: true,
        underscored: false,
        timestamps: true,
      },
      
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      config.DB_NAME,
      config.DB_USER,
      config.DB_PASSWORD,
      {
        dialect: "postgres",
        host: config.DB_HOST,
        port: config.DB_PORT,
        logging: config.ENVIRONMENT === "development" ? console.log : false,

        define: {
          freezeTableName: true,
          underscored: false,
          timestamps: true,
        },
        
        pool: {
          max: 10,
          min: 2,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

const connectDB = async () => {
  try {
    const dbName = config.DATABASE_URL 
      ? new URL(config.DATABASE_URL).pathname.slice(1) 
      : config.DB_NAME;
    
    console.log(` Connecting to PostgreSQL database: ${dbName}`);
    
    await sequelize.authenticate();
    console.log(" Database connection established");
    
    // Sync models (only alter in development, never force)
    if (config.ENVIRONMENT === "development") {
      await sequelize.sync({ alter: true });
      console.log(" Database tables synchronized");
    }
    
    // Log active tables
    const tables = await sequelize.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(` Active tables: ${tables.map(t => t.table_name).join(", ")}`);
    
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    
    // error messages
    if (error.message.includes("does not exist")) {
      console.error(`
💡 Database doesn't exist. Check your connection string or create it.
      `);
    } else if (error.message.includes("password authentication failed")) {
      console.error(" Check your database credentials");
    } else if (error.message.includes("Connection refused") || error.message.includes("ECONNREFUSED")) {
      console.error(" Make sure your database is accessible");
    } else if (error.message.includes("getaddrinfo")) {
      console.error(" Check your database host/connection string");
    }
    
    process.exit(1);
  }
};

export { sequelize, connectDB };
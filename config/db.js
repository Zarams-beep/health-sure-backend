import { Sequelize } from "sequelize";
import config from "./index.js";
import process from "node:process";

const sequelize = config.DATABASE_URL
  ? new Sequelize(config.DATABASE_URL, {
      dialect: "postgres",
      logging: config.ENVIRONMENT === "development" ? console.log : false,
      
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Required for cloud databases
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

        // ADD SSL CONFIG HERE TOO
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
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
      }
    );

const connectDB = async (retries = 5) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database Connected Successfully');
    
    // Verify connection with case-sensitive query
    const [result] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'Users'`
    );
    
    if (result.length > 0) {
      console.log('✅ Users table found');
    }
    
  } catch (error) {
    console.error(`❌ Connection Failed (${retries} retries left):`, error.message);
    
    if (retries > 0) {
      console.log('⏳ Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    
    console.error('❌ All connection attempts failed');
    process.exit(1);
  }
};

export { sequelize, connectDB };
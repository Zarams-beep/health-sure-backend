import cron from 'node-cron'
import fs from 'fs/promises';
import path from 'path';

//Run every hour
cron.schedule('0 * * * *', async () =>{
    const tempDir = path.join("uploads", "temp");
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const file of files) {
    const filePath = path.join(tempDir, file);
    const stats = await fs.stat(filePath);
    
    if (stats.mtimeMs < oneHourAgo) {
      await fs.unlink(filePath).catch(err => 
        console.error(`Error deleting ${file}:`, err)
      );
      console.log(`Cleaned up orphaned file: ${file}`);
    }
  }
})
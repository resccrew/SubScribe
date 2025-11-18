import { MongoClient } from 'mongodb';

// Ваша строка подключения
const uri = "mongodb+srv://popkorntop3320_db_user:o1HpOPKAhmuEg4Pa@subscribe.8hv2auy.mongodb.net/?appName=SubScribe";

const client = new MongoClient(uri);

async function run() {
  console.log("Attempting to connect to MongoDB Atlas...");
  try {
    // Подключаемся к серверу
    await client.connect();
    // Проверяем соединение
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas!");
  } catch (e) {
    console.error("❌ Failed to connect to MongoDB Atlas.");
    console.error(e);
  } finally {
    // Закрываем соединение
    await client.close();
  }
}
run();
const fs = require('node:fs');
const mysql = require('mysql2/promise');
const { EurfImporter } = require('./eurf-importer');
require('dotenv').config();


(async () => {

  // データベースへの接続
  const conn = await mysql.createConnection(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  );

  console.log(`connected`);

  // データベースの作成
  await conn.query(`
    CREATE DATABASE IF NOT EXISTS kobe
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci
  `);

  // データベースの選択
  await conn.query(`use kobe`);

  // ディレクトリ内からcsvファイルを探してインポートする
  const dir = await fs.promises.opendir("../kobe");
  for await (const dirent of dir) {

    switch (true) {
      case dirent.name.endsWith('eurf310005.csv'): {
        // データファイルの取り込み
        console.log(`import: ${dirent.name}`);
        await EurfImporter.fromCsv({
          conn,
          dirent,
        });
        break;
      }

      // TODO: ここは生徒が作る
      //
      // case dirent.name === "000925835.csv": {
      //   // 全国地方公共団体コードの取り込み
      //   await importLgCodeCsvFile({
      //     conn,
      //     dirent,
      //   });
      //   break;
      // }

      default:
        // Do nothing here
        break;
    }
    
    break;
  }
  
  process.exit();
})();


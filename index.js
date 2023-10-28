const fs = require('fs');
const path = require('path');

function chooseLargeFile(folders) {
  const filesMap = new Map(); // 存储每个文件名和对应的大小

  // 扫描每个文件夹
  folders.forEach(folder => {
    const files = fs.readdirSync(folder);
    
    files.forEach(file => {
      const filePath = path.join(folder, file);
      const stats = fs.statSync(filePath);
      
      if (!filesMap.has(file) || stats.size > filesMap.get(file).size) {
        filesMap.set(file, { path: filePath, size: stats.size });
      }
    });
  });

  // 删除小文件并保存大文件
  filesMap.forEach(file => {
    const { path, size } = file;
    
    filesMap.forEach(otherFile => {
      if (otherFile.size < size && otherFile.path !== path) {
        fs.unlinkSync(otherFile.path);
      }
    });
  });
}

// 从命令行参数中获取文件夹路径
const folders = process.argv.slice(2);

chooseLargeFile(folders);

module.exports = chooseLargeFile;
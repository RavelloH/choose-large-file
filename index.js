const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 获取命令行参数
const folder = process.argv[2];

// 创建逐行读取的接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 递归遍历文件夹
function traverseFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }

    const fileMap = new Map();

    // 遍历文件
    files.forEach(file => {
      const filePath = path.join(folderPath, file);

      // 判断是否为文件
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error reading file:', filePath, err);
          return;
        }

        if (stats.isFile()) {
          const fileName = path.basename(file, path.extname(file));
          const fileSize = stats.size;

          // 存储文件信息
          if (!fileMap.has(fileName)) {
            fileMap.set(fileName, {
              path: filePath,
              size: fileSize
            });
          } else {
            const existingFile = fileMap.get(fileName);

            // 比较文件大小
            if (fileSize < existingFile.size) {
              // 删除较小的同名文件
              deleteFile(filePath);
            } else if (fileSize > existingFile.size) {
              deleteFile(existingFile.path);
              fileMap.set(fileName, {
                path: filePath,
                size: fileSize
              });
            }
          }
        }
      });
    });

    // 遍历完成后进行操作确认
    if (fileMap.size > 0) {
      rl.question('是否删除较小的同名文件？（Y/N）', answer => {
        if (answer.toLowerCase() === 'y') {
          deleteFiles(fileMap);
        } else {
          console.log('已取消删除操作');
        }

        rl.close();
      });
    } else {
      console.log('没有找到同名文件');
      rl.close();
    }
  });
}

// 删除文件
function deleteFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) {
      console.error('Error deleting file:', filePath, err);
    } else {
      console.log('文件已成功删除:', filePath);
    }
  });
}

// 删除所有较小的同名文件
function deleteFiles(fileMap) {
  fileMap.forEach(file => {
    deleteFile(file.path);
  });
}

// 开始遍历文件夹
traverseFolder(folder);
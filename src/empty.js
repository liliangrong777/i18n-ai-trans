const path = require('path')
const { execSync } = require("child_process")
const fs = require('fs'); 
const { readFileSync, readdirSync, writeFileSync } = fs;

async function execEmpty({ gitRoot, filePath, fileName }) {
    if (!gitRoot) throw "请配置gitRoot"
    const dir = path.dirname(filePath)
    const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, '/'); // 转换为相对路径
    
    const stdout = await execSync(`git diff ${relativePath}`, { cwd: gitRoot, encoding: "utf-8" })
    // 获取变化行的key
    const changes = stdout.split('\n').filter(line => line.startsWith('+') || line.startsWith('-'));
    const changedKeys = new Set();

    changes.forEach(line => {
        const match = line.match(/["']([^"']+)["']\s*:/); // 匹配 JSON key
        if (match) {
            changedKeys.add(match[1]);
        }
    });

    const keys = [...changedKeys]
    if (keys.length === 0) {
        console.log('没有变化过的key');
        return
    }

    // 获取所有的多语言文件
    const files = await readdirSync(dir).filter(item => {
        if (item.includes(fileName)) return false
        return item.includes('.json')
    })

    // 遍历多语言文件
    files.forEach(async item => {
        const absPath = path.join(dir, item)
        const res = await readFileSync(absPath)
        const data = JSON.parse(res)
        // 将变化过的key清空
        keys.forEach(k => {
            if (data[k]) {
                data[k] = ""
            }
        })
        await writeFileSync(absPath, JSON.stringify(data, null, 2), 'utf-8')
    })
    console.log('清空完成');
}

function empty(config) {
    const absGitRoot = path.join(process.cwd(), config.gitRoot)
    const absSourceDir = path.join(process.cwd(), config.translateDir, config.sourceLang);
    const isDirectory = fs.lstatSync(absSourceDir).isDirectory();

    if (isDirectory) {
        execEmptyForDirectory({
            gitRoot: absGitRoot,
            sourceDir: absSourceDir,
            targetLangs: config.langs.filter(item => item !== config.sourceLang)
        })
    } else {
        execEmpty({
            gitRoot: absGitRoot,
            filePath: absSourceDir,
            fileName:`${config.sourceLang}.json`
        })
    }
}

function getAllJsonFiles(dirPath) {
  let jsonFiles = [];
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = fs.lstatSync(fullPath);
    
    if (stats.isDirectory()) {
      // 递归处理子目录
      jsonFiles = jsonFiles.concat(getAllJsonFiles(fullPath));
    } else if (item.endsWith('.json')) {
      jsonFiles.push(fullPath);
    }
  }
  
  return jsonFiles;
}

function findCorrespondingFile(sourceFile, sourceDir, targetDir) {
  // 获取相对于源目录的路径
  const relativePath = path.relative(sourceDir, sourceFile);
  // 构建目标语言中对应的文件路径
  return path.join(targetDir, relativePath);
}

async function getChangedKeysForFile(gitRoot, filePath) {
  const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, '/');
  
  try {
    const stdout = await execSync(`git diff ${relativePath}`, { cwd: gitRoot, encoding: "utf-8" });
    // 解析更改的键...
    return extractChangedKeys(stdout);
  } catch (err) {
    console.warn(`获取文件 ${relativePath} 的变更信息失败`, err.message);
    return [];
  }
}

function ensureDirectoryStructure(sourceDir, targetDirs) {
  // 获取源目录结构
  const sourceStructure = getDirectoryStructure(sourceDir);
  
  // 确保每个目标目录有相同结构
  for (const targetDir of targetDirs) {
    syncDirectoryStructure(sourceStructure, targetDir);
  }
}

function syncDirectoryStructure(structure, targetBaseDir) {
  // 递归创建缺失的目录
  for (const dir of structure.directories) {
    const targetDirPath = path.join(targetBaseDir, dir.relativePath);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    
    // 递归处理子目录
    syncDirectoryStructure(dir, targetBaseDir);
  }
  
  // 确保文件存在（可以为空）
  for (const file of structure.files) {
    const targetFilePath = path.join(targetBaseDir, file.relativePath);
    if (!fs.existsSync(targetFilePath)) {
      // 创建空的JSON文件，或复制模板
      fs.writeFileSync(targetFilePath, '{}', 'utf-8');
    }
  }
}

async function execEmptyForDirectory(config) {
  const { gitRoot, sourceDir, targetLangs } = config;
  
  // 1. 获取所有源JSON文件
  const sourceFiles = getAllJsonFiles(sourceDir);
  
  // 2. 为每个源文件处理变更
  for (const sourceFile of sourceFiles) {
    // 获取变更的键
    const changedKeys = await getChangedKeysForFile(gitRoot, sourceFile);
    
    if (changedKeys.length === 0) continue;
    
    console.log(`文件 ${path.relative(process.cwd(), sourceFile)} 有 ${changedKeys.length} 个键发生变化`);
    
    // 3. 处理每个目标语言
    for (const lang of targetLangs) {
      const targetDir = path.join(path.dirname(sourceDir), lang);
      const targetFile = findCorrespondingFile(sourceFile, sourceDir, targetDir);
      
      // 确保目标文件存在
      if (!fs.existsSync(targetFile)) {
        const targetFileDir = path.dirname(targetFile);
        if (!fs.existsSync(targetFileDir)) {
          fs.mkdirSync(targetFileDir, { recursive: true });
        }
        fs.writeFileSync(targetFile, '{}', 'utf-8');
      }
      
      // 清空变更的键
      try {
        const content = fs.readFileSync(targetFile, 'utf-8');
        const data = JSON.parse(content);
        
        changedKeys.forEach(key => {
          if (data[key] !== undefined) {
            data[key] = "";
          }
        });
        
        fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
      } catch (err) {
        console.error(`处理文件 ${targetFile} 时出错:`, err.message);
      }
    }
  }
  
  console.log('所有变更键清空完成');
}

/**
 * 从Git diff输出中提取变更的JSON键
 * @param {string} diffOutput - git diff命令的输出
 * @returns {string[]} - 变更的键列表
 */
function extractChangedKeys(diffOutput) {
  const changedKeys = new Set();
  
  // 获取变化行（以 + 或 - 开头的行）
  const changes = diffOutput.split('\n').filter(line => 
    line.startsWith('+') || line.startsWith('-')
  );
  
  // 提取JSON键名
  changes.forEach(line => {
    // 移除前导的 + 或 -
    const contentLine = line.substring(1).trim();
    
    // 匹配 JSON 键模式: "key": value 或 'key': value
    const match = contentLine.match(/["']([^"']+)["']\s*:/);
    if (match) {
      changedKeys.add(match[1]);
    }
  });
  
  return [...changedKeys];
}

module.exports = { empty } 
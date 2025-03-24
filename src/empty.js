const path = require('path')
const { execSync } = require("child_process")
const fs = require('fs'); 
const { readFileSync, readdirSync, writeFileSync } = fs;
const { getLangStat } = require('./utils');

/**
 * 查找两个嵌套JSON对象之间的差异路径
 * @param {Object} oldObj - 旧的JSON对象
 * @param {Object} newObj - 新的JSON对象
 * @param {String} parentPath - 父路径
 * @param {Set} changedPaths - 变更路径集合
 */
function findChangedPaths(oldObj, newObj, parentPath = '', changedPaths = new Set()) {
  // 检查旧对象中存在但新对象中不存在或值已更改的键
  for (const key in oldObj) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    
    // 键在新对象中不存在
    if (!(key in newObj)) {
      changedPaths.add(currentPath);
      continue;
    }
    
    // 两者都是对象，需要递归检查
    if (typeof oldObj[key] === 'object' && oldObj[key] !== null && 
        typeof newObj[key] === 'object' && newObj[key] !== null) {
      findChangedPaths(oldObj[key], newObj[key], currentPath, changedPaths);
    } 
    // 值不同
    else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changedPaths.add(currentPath);
    }
  }
  
  // 检查新对象中存在但旧对象中不存在的键
  for (const key in newObj) {
    if (!(key in oldObj)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      changedPaths.add(currentPath);
    }
  }
  
  return changedPaths;
}

/**
 * 根据路径清空对象中的特定值
 * @param {Object} obj - 要修改的对象
 * @param {String} path - 点分隔的路径，如 "a.b.c"
 */
function clearValueAtPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  // 遍历路径的所有部分，除了最后一个
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // 如果路径中间的对象不存在，则不需要继续
    if (!current[part] || typeof current[part] !== 'object') {
      return;
    }
    current = current[part];
  }
  
  // 获取最后一个部分（要清空的键）
  const lastPart = parts[parts.length - 1];
  
  // 如果该键存在，将其清空
  if (lastPart in current) {
    if (typeof current[lastPart] === 'object' && current[lastPart] !== null) {
      // 如果是对象，递归清空所有值
      clearObjectValues(current[lastPart]);
    } else {
      current[lastPart] = "";
    }
  }
}

/**
 * 递归清空对象中的所有值
 * @param {Object} obj - 要清空的对象
 */
function clearObjectValues(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      clearObjectValues(obj[key]);
    } else {
      obj[key] = "";
    }
  }
}

async function execEmpty({ gitRoot, filePath, fileName }) {
  if (!gitRoot) throw "请配置gitRoot";
  const dir = path.dirname(filePath);
  const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, '/');
  
  // 获取旧内容
  let oldContent = {};
  try {
    const oldContentStr = await execSync(`git show HEAD~1:${relativePath}`, { cwd: gitRoot, encoding: "utf-8" });
    oldContent = JSON.parse(oldContentStr);
  } catch (err) {
    console.warn(`获取文件 ${relativePath} 的历史版本失败:`, err.message);
    console.log('将使用空对象作为旧内容进行比较');
  }
  
  // 获取新内容
  let newContent = {};
  try {
    const newContentStr = await readFileSync(filePath, "utf-8");
    newContent = JSON.parse(newContentStr);
  } catch (err) {
    console.error(`读取文件 ${filePath} 失败:`, err.message);
    return;
  }
  
  // 获取变化的路径
  const changedPaths = findChangedPaths(oldContent, newContent);
  
  if (changedPaths.size === 0) {
    console.log('没有变化过的key');
    return;
  }
  
  console.log(`找到 ${changedPaths.size} 个变化的路径`);
  
  // 获取所有的多语言文件
  const files = await readdirSync(dir).filter(item => {
    if (item.includes(fileName)) return false;
    return item.includes('.json');
  });

  // 遍历多语言文件
  for (const item of files) {
    const absPath = path.join(dir, item);
    try {
      const res = await readFileSync(absPath, "utf-8");
      const data = JSON.parse(res);
      
      // 清空所有变化路径的值
      changedPaths.forEach(path => {
        clearValueAtPath(data, path);
      });
      
      await writeFileSync(absPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`已更新文件: ${item}`);
    } catch (err) {
      console.error(`处理文件 ${absPath} 时出错:`, err.message);
    }
  }
  
  console.log('清空完成');
}

async function getChangedPathsForFile(gitRoot, filePath) {
  const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, '/');
  
  try {
    // 获取旧内容
    let oldContent = {};
    try {
      const oldContentStr = await execSync(`git show HEAD~1:${relativePath}`, { cwd: gitRoot, encoding: "utf-8" });
      oldContent = JSON.parse(oldContentStr);
    } catch (err) {
      console.warn(`获取文件 ${relativePath} 的历史版本失败:`, err.message);
      console.log('将使用空对象作为旧内容进行比较');
    }
    
    // 获取新内容
    let newContent = {};
    try {
      const newContentStr = await fs.readFileSync(filePath, "utf-8");
      newContent = JSON.parse(newContentStr);
    } catch (err) {
      console.error(`读取文件 ${filePath} 失败:`, err.message);
      return new Set();
    }
    
    return findChangedPaths(oldContent, newContent);
  } catch (err) {
    console.warn(`获取文件 ${relativePath} 的变更信息失败`, err.message);
    return new Set();
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

async function execEmptyForDirectory(config) {
  const { gitRoot, sourceDir, targetLangs } = config;
  
  // 使用utils.js中的函数获取源语言内容
  const sourceFiles = getAllJsonFiles(sourceDir);
  
  for (const sourceFile of sourceFiles) {
    // 获取变更的路径
    const changedPaths = await getChangedPathsForFile(gitRoot, sourceFile);
    
    if (changedPaths.size === 0) continue;
    
    console.log(`文件 ${path.relative(process.cwd(), sourceFile)} 有 ${changedPaths.size} 个路径发生变化`);
    
    // 处理每个目标语言
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
        
        changedPaths.forEach(path => {
          clearValueAtPath(data, path);
        });
        
        fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`已更新文件: ${path.relative(process.cwd(), targetFile)}`);
      } catch (err) {
        console.error(`处理文件 ${targetFile} 时出错:`, err.message);
      }
    }
  }
  
  console.log('所有变更路径清空完成');
}

function empty(config) {
  const absGitRoot = path.join(process.cwd(), config.gitRoot);
  const { isDir, isFile } = getLangStat(path.join(process.cwd(), config.translateDir), config.sourceLang);

  if (isDir) {
    const absSourceDir = path.join(process.cwd(), config.translateDir, config.sourceLang);
    execEmptyForDirectory({
      gitRoot: absGitRoot,
      sourceDir: absSourceDir,
      targetLangs: config.langs.filter(item => item !== config.sourceLang)
    });
  } else if (isFile) {
    const absFilePath = path.join(process.cwd(), config.translateDir, `${config.sourceLang}.json`);
    execEmpty({
      gitRoot: absGitRoot,
      filePath: absFilePath,
      fileName: `${config.sourceLang}.json`
    });
  } else {
    console.error(`找不到语言源文件或目录: ${config.sourceLang}`);
  }
}

module.exports = { empty }; 
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.join(projectRoot, "assets");
const defaultDir = path.join(assetsDir, "default");
const specialDir = path.join(assetsDir, "special");
const outputFile = path.join(assetsDir, "memes.json");
const LINK_FILE_NAME = "links.txt";

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name !== LINK_FILE_NAME) {
      files.push(fullPath);
    }
  }
  return files;
}

function readLinksFile(dir) {
  const filePath = path.join(dir, LINK_FILE_NAME);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function toAssetPath(absolutePath) {
  return `assets/${path.relative(assetsDir, absolutePath).split(path.sep).join("/")}`;
}

const defaultMemes = listFilesRecursive(defaultDir).map(toAssetPath);
const defaultLinks = readLinksFile(defaultDir);
const defaultList = defaultMemes.concat(defaultLinks).sort();

const specialMemes = {};
if (fs.existsSync(specialDir)) {
  const people = fs.readdirSync(specialDir, { withFileTypes: true });
  for (const person of people) {
    if (!person.isDirectory()) continue;
    const personDir = path.join(specialDir, person.name);
    const files = listFilesRecursive(personDir).map(toAssetPath);
    const links = readLinksFile(personDir);
    const list = files.concat(links).sort();
    if (list.length) {
      specialMemes[person.name] = list;
    }
  }
}

const payload = {
  default: defaultList,
  special: specialMemes,
};

fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
console.log(`Memes index gerado em ${outputFile}`);

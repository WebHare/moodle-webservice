"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const getInterfaceName = (fileName) => {
    return fileName.slice(0, -3);
};
const getFiles = (path) => {
    const interfaceFiles = fs.readdirSync(path);
    return interfaceFiles
        .filter((interfaceFile) => interfaceFile !== 'index.ts')
        .map((interfaceFile) => ({
        file: interfaceFile,
        name: getInterfaceName(interfaceFile),
    }));
};
const writeInterfaceImport = (inter) => {
    const data = `import type ${inter.name} from "./${inter.name}";\n`;
    return data;
};
const writeInterfacesImport = (interfaces) => {
    let data = '';
    for (const inter of interfaces) {
        data = data.concat(writeInterfaceImport(inter));
    }
    return data;
};
const writeInterfaceExport = (inter) => {
    const data = `${inter.name},\n`;
    return data;
};
const writeInterfacesExport = (interfaces) => {
    let data = 'export type {';
    for (const inter of interfaces) {
        data = data.concat(writeInterfaceExport(inter));
    }
    data = data.concat('};');
    return data;
};
const writeIndexFile = (interfaces) => {
    console.log('Writing imports...');
    let data = writeInterfacesImport(interfaces);
    console.log('Writing exports...');
    data = data.concat(writeInterfacesExport(interfaces));
    return data;
};
const createIndexFile = (folder) => {
    console.log('creating index file..');
    const folderPath = path_1.default.resolve(__dirname, `../${folder}`);
    fs.writeFileSync(path_1.default.resolve(folderPath, 'index.ts'), writeIndexFile(getFiles(folderPath)));
};
createIndexFile('types');

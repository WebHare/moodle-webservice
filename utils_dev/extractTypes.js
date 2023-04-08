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
const prettier = __importStar(require("prettier"));
const path_1 = __importDefault(require("path"));
const PRETTIER_CONFIG = {
    singleQuote: true,
    tabWidth: 2,
    useTabs: false,
    parser: 'typescript',
};
const format = (data) => prettier.format(data, PRETTIER_CONFIG);
const definitionJSON = fs.readFileSync(path_1.default.resolve(__dirname, '../api', 'functions.json'), 'utf8');
const signatureJSON = fs.readFileSync(path_1.default.resolve(__dirname, '../api', 'function-signatures.json'), 'utf8');
const definition = JSON.parse(definitionJSON);
const signatures = JSON.parse(signatureJSON).items;
const extractModules = () => {
    const modules = [];
    for (const item of definition.items) {
        const module = modules.find((module) => module.name === item.module);
        if (!module) {
            const newModule = {
                name: item.module,
                facilities: [
                    {
                        name: item.facility,
                        functions: [{ name: item.preferName, apiName: item.name }],
                    },
                ],
            };
            modules.push(newModule);
            continue;
        }
        else {
            const facility = module.facilities.find((facility) => facility.name === item.facility);
            if (!facility) {
                const newFacility = {
                    name: item.facility,
                    functions: [{ name: item.preferName, apiName: item.name }],
                };
                module.facilities.push(newFacility);
                continue;
            }
            else {
                const func = facility.functions.find((func) => func.name === item.preferName);
                if (!func) {
                    facility.functions.push({
                        name: item.preferName,
                        apiName: item.name,
                    });
                }
            }
        }
    }
    return modules;
};
const upperCaseFirst = (str) => { var _a; return `${(_a = str.at(0)) === null || _a === void 0 ? void 0 : _a.toUpperCase()}${str.slice(1)}`; };
const getInterfaceName = (module) => `IMoodleWS${upperCaseFirst(module.name)}`;
const parseTypeName = (typeName) => {
    let type = undefined;
    if (typeName.at(0) === 'I')
        type = 'interface';
    let rawName = '';
    if (type === 'interface') {
        rawName = /(^[a-zA-Z_$][a-zA-Z_$0-9]*)[\[\]]*/.exec(typeName)[1];
    }
    return { rawName, type };
};
const writeFunctionSignature = (func, signature) => {
    var _a;
    let renderedSignature = `/** ${(_a = definition.items.find((item) => item.name === func.apiName)) === null || _a === void 0 ? void 0 : _a.description} */\n`;
    if (signature) {
        renderedSignature = renderedSignature.concat(`${func.name}: (${signature.body
            ? `params${signature.body.optional ? '?' : ''}: ${signature.body.type}`
            : ''}) => Promise<${signature.result ? signature.result.type : 'void'}>;`);
    }
    else {
        renderedSignature = renderedSignature.concat(`${func.name}: (payload: IMoodleWSPayload) => Promise<any>;`);
    }
    return renderedSignature;
};
const writeFacilityFunctions = (facility) => {
    let functions = ``;
    for (const func of facility.functions) {
        const signature = signatures.find((sig) => sig.name === func.apiName);
        functions = functions
            .concat(writeFunctionSignature(func, signature))
            .concat('\n');
    }
    return functions;
};
const writeFacilityObject = (facility) => {
    return `${facility.name}: {
    ${writeFacilityFunctions(facility)}
    };`;
};
const writeModuleFacilties = (module) => {
    let facilities = ``;
    for (const facility of module.facilities) {
        facilities = facilities.concat(writeFacilityObject(facility)).concat('\n');
    }
    return facilities;
};
const writeModuleImports = (module) => {
    const imports = ['IMoodleWSPayload'];
    for (const facility of module.facilities) {
        for (const func of facility.functions) {
            const signature = signatures.find((sig) => sig.name === func.apiName);
            if (signature) {
                if (signature.body) {
                    const type = parseTypeName(signature.body.type);
                    if (!imports.includes(type.rawName) && type.type === 'interface')
                        imports.push(type.rawName);
                }
                if (signature.result) {
                    const type = parseTypeName(signature.result.type);
                    if (!imports.includes(type.rawName) && type.type === 'interface')
                        imports.push(type.rawName);
                }
            }
        }
    }
    return imports.map((imp) => `import ${imp} from './${imp}'`).join('\n');
};
const writeModuleInterface = (module) => {
    return `export default interface ${getInterfaceName(module)} {
    ${writeModuleFacilties(module)}
  }`;
};
const createModuleFile = (module) => {
    const moduleFileData = format(`${writeModuleImports(module)}\n\n${writeModuleInterface(module)}`);
    const interfaceName = getInterfaceName(module);
    fs.writeFileSync(path_1.default.resolve(__dirname, '../interfaces', `${interfaceName}.ts`), moduleFileData);
};
const createModuleFiles = (modules) => {
    for (const module of modules) {
        createModuleFile(module);
    }
};
const writeImportModule = (module) => {
    const interfaceName = getInterfaceName(module);
    return `import ${interfaceName} from './${interfaceName}'`;
};
const writeImportApiModules = (modules) => {
    let imports = ``;
    for (const module of modules) {
        imports = imports.concat(writeImportModule(module)).concat('\n');
    }
    return imports;
};
const writeModuleObject = (module) => `${module.name}: ${getInterfaceName(module)};`;
const writeApiModules = (modules) => {
    let apiModules = ``;
    for (const module of modules) {
        apiModules = apiModules.concat(writeModuleObject(module)).concat('\n');
    }
    return apiModules;
};
const writeApiInterface = (modules) => {
    return `export default interface IMoodleWSAPI {
        ${writeApiModules(modules)}
    }`;
};
const createApiFile = (modules) => {
    const apiFileData = `${writeImportApiModules(modules)}\n\n${writeApiInterface(modules)}`;
    fs.writeFileSync(path_1.default.resolve(__dirname, `../interfaces`, 'IMoodleWSAPI.ts'), format(apiFileData));
};
const extractApiTypes = (modules) => {
    createModuleFiles(modules);
    createApiFile(modules);
};
extractApiTypes(extractModules());

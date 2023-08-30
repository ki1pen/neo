#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander/esm.mjs';
import envinfo from 'envinfo';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const
    __dirname = fileURLToPath(new URL('../../', import.meta.url)),
    cwd = process.cwd(),
    requireJson = path => JSON.parse(fs.readFileSync((path))),
    packageJson = requireJson(path.join(__dirname, 'package.json')),
    insideNeo = process.env.npm_package_name === 'neo.mjs',
    program = new Command(),
    programName = `${packageJson.name} create-class`,
    questions = [],
    /**
     * Maintain a list of dir-names recognized as source root directories.
     * When not using dot notation with a class-name, the program assumes
     * that we want to create the class inside the cwd. The proper namespace
     * is then looked up by traversing the directory path up to the first
     * folder that matches an entry in "sourceRootDirs". The owning
     * folder (parent of cwd, child of sourceRootDirs[n]) will then be used as the
     * namespace for this created class.
     * Can be overwritten with the -s option.
     * @type {String[]}
     */
    sourceRootDirs = ['apps'];

program
    //    .name('huhu')
    .version(packageJson.version)
    .option('-b, --baseClass <value>')
    .option('-c, --className <value>')
    .allowUnknownOption()
    .parse(process.argv);

const programOpts = program.opts();
let className = programOpts.className;

let ns = className.split('.');
let file = ns.pop();
let root = ns.shift();
let rootLowerCase = root.toLowerCase();

// let classFolder = path.join(cwd,  '/src/', ns.join('/'));
const forNonNeoPathArray = ns.filter(f => f !== 'view');
let nonNeoPath = `apps/${rootLowerCase}`;
if (forNonNeoPathArray.length > 0) {
    nonNeoPath = nonNeoPath.concat('/', forNonNeoPathArray.join('/'));
}

let classFolder = path.join(cwd, 'resources/scss/src/', rootLowerCase === 'neo' ? `/${ns.join('/')}` : nonNeoPath);

if (!fs.existsSync(classFolder)) {
    fs.mkdirpSync(classFolder, { recursive: true });
}

const scssClassName = getScssClassName(file, rootLowerCase);
const template = `.${scssClassName} {
    // add css information here
}`;
createScssStub(classFolder, file, template);

// iterate over themes
let themeFoldersPath = path.join(cwd, 'resources/scss/');

const themeFolders = listDirectories(themeFoldersPath);
themeFolders.forEach(theme => {
    const forNonNeoPathArray = ns.filter(f => f !== 'view');
    let nonNeoPath = `apps/${rootLowerCase}`;
    if (forNonNeoPathArray.length > 0) {
        nonNeoPath = nonNeoPath.concat('/', forNonNeoPathArray.join('/'));
    }
    classFolder = path.join(cwd, 'resources/scss/', theme, rootLowerCase === 'neo' ? `/${ns.join('/')}` : nonNeoPath);
    if (!fs.existsSync(classFolder)) {
        fs.mkdirpSync(classFolder, { recursive: true });
    }
    const themeTemplate = `:root .${rootLowerCase}-${theme} { // .${scssClassName}
        // add css theme information here
}`;
    createScssStub(classFolder, file, themeTemplate);
})

function listDirectories(path) {
    return fs.readdirSync(path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('theme'))
        .map(dirent => dirent.name);
}

function createScssStub(classFolder, file, template) {
    //template

    const scssFile = `${classFolder}/${file}.scss`;

    fs.writeFileSync(scssFile, `${template}${os.EOL}`);
}

function getScssClassName(file, namespace) {
    //template

    let temp = file.split(/(?=[A-Z])/);
    temp.splice(0, 0, namespace);
    const scssClassName = temp.join('-').toLowerCase();

    return scssClassName;
}
#!/usr/bin/env node

const { program } = require("commander");
const OpenCC = require("opencc");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const ora = require("ora");

const spinner = ora();

const covertTypes = [
  "s2t",
  "t2s",
  "s2tw",
  "tw2s",
  "s2hk",
  "hk2s",
  "s2twp",
  "tw2sp",
  "t2tw",
  "hk2t",
  "tw2t",
];

program
  .option(
    "-c, --covert <type>",
    "What type of covert: [s2t|t2s|s2tw|tw2s|s2hk|hk2s|s2twp|tw2sp|t2tw|hk2t|tw2t]",
  )
  .option("-s, --source [path]", "source folder or file")
  .option("-d, --destination [path]", "destination folder");

const configFromFile = () => {
  const configPath = path.resolve('./opencc.config.js');
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }
  return {};
}

try {
  program.parse(process.argv);
  const options = { covert: "tw2sp", ...configFromFile(), ...program.opts() };

  // check covert type
  if (!covertTypes.includes(options.covert)) {
    throw new Error(`Not support this covert type: ${options.covert}! Please check help.`);
  }

  // check source
  if (!options.source) {
    throw new Error("Need source folder or file");
  }

  // check destination
  if (!options.destination) {
    throw new Error("destination folder");
  } else if(path.extname(options.destination) !== ""){
    throw new Error("destination must be a folder");
  }

  const converter = new OpenCC(`${options.covert}.json`);

  (async () => {
    spinner.start();

    const files = glob.sync(options.source);
    for(let file of files){
      if (fs.statSync(file).isDirectory()) {
        const files2 = glob.sync(`${options.source}/**`, { nodir: true });
        for(let file2 of files2){
          await covertAndWriteFile(file2);
        }
      } else {
        await covertAndWriteFile(file);
      }
    }

    spinner.succeed("Success!");
  })();

  async function convert(text) {
    var result = await converter.convertPromise(text);
    const terms = options.terms || [];
    for (let wordMap of terms) {
      const matchTerm = new RegExp(wordMap[0], "g");
      const isFind = result.match(matchTerm);
      if (!isFind) {
        continue;
      }
      result = result.replace(matchTerm, wordMap[1]);
    }
    return result;
  }

  async function covertAndWriteFile(file)  {
    const data = fs.readFileSync(file, "utf-8");
    const converted = await convert(data);
    const diffPath = path.relative(path.dirname(options.source), file).replace(/\.\.\//, "");
    const diffDirPath = path.join(
      options.destination,
      path.dirname(diffPath)
    );
    if (!fs.existsSync(diffDirPath)) {
      fs.mkdirSync(diffDirPath, { recursive: true });
    }
    const destFile = path.join(options.destination, diffPath);
    fs.writeFileSync(destFile, converted);
    spinner.text = `${file} -> ${destFile}`;
  }

} catch (err) {
  spinner.fail(err.message);
  process.exit();
}
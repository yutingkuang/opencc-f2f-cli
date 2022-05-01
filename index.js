#!/usr/bin/env node

const { program } = require("commander");
const OpenCC = require("opencc");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

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
  .requiredOption(
    "-c, --covert <type>",
    "What type of covert: [s2t|t2s|s2tw|tw2s|s2hk|hk2s|s2twp|tw2sp|t2tw|hk2t|tw2t]",
    "tw2s"
  )
  .requiredOption("-s, --source <path>", "source folder or file")
  .requiredOption("-d, --destination <path>", "destination folder");

program.parse(process.argv);
const options = program.opts();

let hasError = false;

// check covert type
if (!covertTypes.includes(options.covert)) {
  console.log(`Not support this covert type: ${options.covert}!`);
  console.log("Please check help.");
  hasError = true;
}

if (hasError) {
  process.exit();
}

const converter = new OpenCC(`${options.covert}.json`);

glob(options.source, {}, function (er, files) {
  files.forEach(function (file) {
    if (fs.statSync(file).isDirectory()) {
      glob(`${options.source}/**`, { nodir: true }, (er2, files2) => {
        files2.forEach(function (file2) {
          covertAndWriteFile(file2);
        });
      });
    } else {
      covertAndWriteFile(file);
    }
  });
});

function covertAndWriteFile(file) {
  fs.readFile(file, "utf8", function (err, data) {
    const fileName = path.basename(file);

    converter.convertPromise(data).then((converted) => {
      const diffPath = path
        .relative(path.dirname(options.source), file)
        .replace(/\.\.\//, "");
      const diffDirPath = path.join(
        options.destination,
        path.dirname(diffPath)
      );

      if (!fs.existsSync(diffDirPath)) {
        fs.mkdirSync(diffDirPath, { recursive: true }, (err) => {
          if (err) {
            console.error("mkdir err: ", err);
            process.exit();
          }
        });
      }

      fs.writeFile(
        path.join(options.destination, diffPath),
        converted,
        (err) => {
          if (err) console.error("writeFile err: ", err);
          process.exit();
        }
      );
    });
  });
}

console.info("\x1b[32m", "success!");

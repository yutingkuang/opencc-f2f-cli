# Open Chinese Convert Folder to Folder (File to File) CLI

### Installation 安裝 [npm](https://www.npmjs.com/package/opencc-f2f-cli)

```
npm install -g opencc-f2f-cli
```

### Usage

```console
# file to file covert
opencc-f2f-cli -s ./locales/zh-tw/error.js -d ./locales/zh-cn/

# folder to folder covert
opencc-f2f-cli -s ./locales/zh-tw/ -d ./locales/zh-cn/

# use wildword to match specific file extension
opencc-f2f-cli -s ./locales/zh-tw/\*\*/\*.js -d ./locales/zh-cn/
```

`opencc-f2f-cli -h `

```console
Usage: opencc-f2f-cli [options]

Options:
  -c, --covert <type>       What type of covert: [s2t|t2s|s2tw|tw2s|s2hk|hk2s|s2twp|tw2sp|t2tw|hk2t|tw2t] (default: "tw2s")
  -s, --source <path>       source folder or file
  -d, --destination <path>  destination folder
  -h, --help                display help for command
```

covert type 請參考原套件 [Open Chinese Convert](https://github.com/BYVoid/OpenCC) 說明

### Reference

- Open Chinese Convert - https://github.com/BYVoid/OpenCC

const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');
const path = './img/';
const display = {
  success: 'Success... You create new file with watermark',
  fail: 'Something went wrong... Try again!',
  failFile: 'Something went wrong... File not exist!',
};
const config = {
  file: 'test.png',
  logo: 'logo.png',
}

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };
  
  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  try {
    await image.quality(100).writeAsync(outputFile);
  }
  catch(error) {
    console.log(display.fail);
  }
  console.log(display.success);
  startApp();
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  try {
    await image.quality(100).writeAsync(outputFile);
  }
  catch(error) {
    console.log(display.fail);
  }
  console.log(display.success);
  startApp();
};

const prepareOutputFilename = file => {
  const fileParts = file.split('.');
  return fileParts[0] + '-with-watermark.' + fileParts[1];
};

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager".\n Copy your image files to `/img` folder. Then you\'ll be able to use them in the app.\n Are you ready?',
      type: 'confirm'
    }]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // ask about input file and watermark type
  const file = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: config.file,
  }]);

  if(fs.existsSync(path + file.inputImage)) {
    const type = await inquirer.prompt([{
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }])

    if(type.watermarkType === 'Text watermark') {
      const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      }]);
      file.watermarkText = text.value;
      addTextWatermarkToImage(path + file.inputImage, path + prepareOutputFilename(file.inputImage), file.watermarkText);
    }
    else {
      const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: config.logo,
      }]);
      file.watermarkImage = image.filename;
      fs.existsSync(path + file.watermarkImage)
      ? addImageWatermarkToImage(path + file.inputImage, path + prepareOutputFilename(file.inputImage), path + file.watermarkImage)
      : console.log(display.failFile)
    }
  } else {
    console.log(display.failFile);
    startApp();
  }
}

startApp();
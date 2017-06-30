rm -rf dist
babel src --out-dir dist
cp package.json dist
npm publish dist

rm -rf dist
cp package.json dist
babel src --out-dir dist
npm publish dist

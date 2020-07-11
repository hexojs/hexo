#!/bin/sh

echo "- Set up dummy Hexo site"
cd $TRAVIS_BUILD_DIR
cd ..
git clone https://github.com/hexojs/hexo-theme-unit-test.git --depth=1 --quiet
cd hexo-theme-unit-test

echo "- Install hexo-theme-landscape"
git clone https://github.com/hexojs/hexo-theme-landscape --depth=1 --quiet themes/landscape

echo "- npm install"
npm install --silent

echo "- Import 500 posts"
git clone https://github.com/SukkaLab/hexo-many-posts.git source/_posts/hexo-many-posts --depth=1 --quiet
rm -rf source/_posts/hexo-many-posts/.git/

echo "- Replace node_modules/hexo"
rm -rf node_modules/hexo
ln -sf $TRAVIS_BUILD_DIR node_modules/hexo

echo "- Start test run"
echo ""

echo "--------------------------------------------"
npx --no-install hexo clean > build.log

echo ""
echo "- Generating flamegraph..."

npm install 0x --silent
npx 0x --output-dir "${TRAVIS_BUILD_DIR}/0x" -- npx --no-install hexo g > build.log 2>&1 ;

echo "Flamegraph will be deployed to: https://${TRAVIS_COMMIT}-${TRAVIS_NODE_VERSION}-hexo.surge.sh/flamegraph.html"

rm -rf build.log
cd $TRAVIS_BUILD_DIR

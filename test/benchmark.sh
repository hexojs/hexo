#!/bin/sh

echo "========== Hexo Benchmark =========="

echo "- Set up dummy Hexo site"
cd $TRAVIS_BUILD_DIR
cd ..
git clone https://github.com/hexojs/hexo-theme-unit-test.git --depth=1 --quiet
cd hexo-theme-unit-test

echo "- Install hexo-theme-landscape"
git clone https://github.com/hexojs/hexo-theme-landscape --depth=1 --quiet themes/landscape

echo "- npm install"
npm install --silent

echo "- Import 300 posts"
git clone https://github.com/SukkaLab/hexo-many-posts.git source/_posts/hexo-many-posts --depth=1 --quiet
rm -rf source/_posts/hexo-many-posts/.git/

echo "- Replace node_modules/hexo"
ln -sf $TRAVIS_BUILD_DIR node_modules/hexo

echo "- Start test run"

echo "-------------- Test 1 --------------"
npx --no-install hexo g --debug > build.log
cat build.log | grep "Hexo version"
cat build.log | grep "Start processing"
cat build.log | grep "loaded in"
cat build.log | grep "generated in"
cat build.log | grep "Database saved"
echo "-------------- Test 2 --------------"
npx --no-install hexo g --debug > build.log
cat build.log | grep "Hexo version"
cat build.log | grep "Start processing"
cat build.log | grep "loaded in"
cat build.log | grep "generated in"
cat build.log | grep "Database saved"
rm -rf build.log

cd $TRAVIS_BUILD_DIR

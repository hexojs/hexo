#!/bin/sh

_SUBSTRUCTION () {
    echo | awk "{print $1-$2}"
}

_MESSAGE_FORMATTER () {
    awk '{printf "| %-29s | %7.3fs |\n",$1" "$2,$3"s"}'
}

LOG_TABLE () {
    time_begin=$(date +%s -d "$(awk '/.*DEBUG Hexo version/{print $1}' build.log)")
    time_process_start=$(date +%s.%3N -d "$(awk '/.*INFO  Start processing/{print $1}' build.log)")
    time_render_start=$(date +%s.%3N -d "$(awk '/.*INFO  Files loaded in/{print $1}' build.log)")
    time_render_finish=$(date +%s.%3N -d "$(awk '/.*INFO.*generated in /{print $1}' build.log)")
    time_database_saved=$(date +%s.%3N -d "$(awk '/.*DEBUG Database saved/{print $1}' build.log)")

    echo "Load Plugin/Scripts/Database $(_SUBSTRUCTION $time_process_start $time_begin)" | _MESSAGE_FORMATTER
    echo "Process Source $(_SUBSTRUCTION $time_render_start $time_process_start)" | _MESSAGE_FORMATTER
    echo "Render Files $(_SUBSTRUCTION $time_render_finish $time_render_start)" | _MESSAGE_FORMATTER
    echo "Save Database $(_SUBSTRUCTION $time_database_saved $time_render_finish)" | _MESSAGE_FORMATTER
    echo "Total time $(_SUBSTRUCTION $time_database_saved $time_begin)" | _MESSAGE_FORMATTER
}

echo "============== Hexo Benchmark =============="

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
rm -rf node_modules/hexo
ln -sf $TRAVIS_BUILD_DIR node_modules/hexo

echo "- Start test run"

echo "------------- Cold processing --------------"
npx --no-install hexo g --debug > build.log
LOG_TABLE

echo "-------------- Hot processing --------------"
npx --no-install hexo g --debug > build.log
LOG_TABLE

echo "--------- Another Cold processing ----------"
npx --no-install hexo clean > build.log
npx --no-install hexo g --debug > build.log
LOG_TABLE

rm -rf build.log

cd $TRAVIS_BUILD_DIR
